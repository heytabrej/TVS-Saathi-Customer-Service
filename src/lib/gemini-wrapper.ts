/**
 * REST-based Gemini wrapper (no @google/generative-ai import).
 * Enhancements:
 *  - Model fallback chain
 *  - Circuit breaker
 *  - Sliding window + summarization
 *  - Structured logging hooks
 */
import { MODEL_PREFERENCE, MAX_HISTORY_MESSAGES, SUMMARIZE_AFTER, CIRCUIT_BREAKER_THRESHOLD, CIRCUIT_BREAKER_COOLDOWN_MS, ESCALATION_KEYWORDS } from './ai-config';
import { log } from './logging';
export interface CustomerContext {
  customerId: string;
  customerContext: {
    name: string;
    language: string;
    loanStatus: string;
    emiDueDate: string;
    emiAmount: number;
  };
}
export interface AgentResponse {
  message: string;
  agent: string;
  nextAction?: string;
  confidence: number;
  requiresEscalation: boolean;
}
type Role = 'user' | 'model';
interface ConversationMessage { role: Role; parts: { text: string }[] }
interface SessionState { history: ConversationMessage[]; lastAgent?: string; summary?: string; onboarding?: OnboardingState; }
const store = new Map<string, SessionState>();

// Circuit breaker & model health state
let consecutiveFailures = 0;
let breakerOpenedAt: number | null = null;
let healthyModels: string[] = [...MODEL_PREFERENCE];

function circuitOpen() {
  if (breakerOpenedAt && Date.now() - breakerOpenedAt < CIRCUIT_BREAKER_COOLDOWN_MS) return true;
  if (breakerOpenedAt && Date.now() - breakerOpenedAt >= CIRCUIT_BREAKER_COOLDOWN_MS) {
    breakerOpenedAt = null; consecutiveFailures = 0;
  }
  return false;
}

interface OnboardingState {
  income?: string;
  occupation?: string;
  desiredAmount?: string;
  tenureMonths?: string;
  purpose?: string;
  documentsReady?: boolean;
  lastAsked?: string;
  completed?: boolean;
}
const ONBOARDING_STEPS: { key: keyof OnboardingState; question: string; extractor: RegExp[] }[] = [
  { key: 'income', question: 'What is your monthly income (approximate amount in INR)?', extractor: [/\b(?:income|earning|salary)\D{0,10}(\d{4,7})\b/i, /\b(\d{4,7})\s*(?:INR|rs|rupees)\b/i] },
  { key: 'occupation', question: 'What is your occupation? (e.g. farmer, salaried, self-employed, driver)', extractor: [/\b(farmer|salaried|self[-\s]?employed|driver|student|shopkeeper|business)\b/i] },
  { key: 'desiredAmount', question: 'How much loan amount do you want (in INR)?', extractor: [/\b(\d{4,7})\b/] },
  { key: 'tenureMonths', question: 'Preferred repayment period in months?', extractor: [/\b(\d{1,3})\s*(?:months|month|m)\b/i] },
  { key: 'purpose', question: 'What is the purpose? (bike purchase, small business, education, farming, other)', extractor: [/\b(bike|two\s?wheeler|business|education|farm|farming|tractor|home|medical)\b/i] },
  { key: 'documentsReady', question: 'Do you have your basic documents ready? (ID proof, address proof, income proof)', extractor: [/\b(yes|no|yep|ready|not yet)\b/i] }
];

function initOnboarding(sess: SessionState) {
  if (!sess.onboarding) sess.onboarding = {};
  return sess.onboarding!;
}

function extractOnboarding(onb: OnboardingState, userText: string) {
  for (const step of ONBOARDING_STEPS) {
    if (onb[step.key]) continue;
    for (const rx of step.extractor) {
      const m = userText.match(rx);
      if (m) {
        onb[step.key] = (m[1] || m[0]).toString();
        if (step.key === 'documentsReady') {
          const val = (onb[step.key] as string).toLowerCase();
            onb[step.key] = /yes|ready|yep/.test(val) ? 'true' : 'false';
        }
        break;
      }
    }
  }
  // Mark completion
  const allFilled = ONBOARDING_STEPS.every(s => !!onb[s.key]);
  if (allFilled) onb.completed = true;
}

function nextOnboardingQuestion(onb: OnboardingState): { stepIndex: number; question?: string } {
  for (let i = 0; i < ONBOARDING_STEPS.length; i++) {
    const s = ONBOARDING_STEPS[i];
    if (!onb[s.key]) return { stepIndex: i, question: s.question };
  }
  return { stepIndex: ONBOARDING_STEPS.length - 1 };
}

function formatOnboardingSummary(onb: OnboardingState) {
  return `Great. I have:
- Monthly Income: ${onb.income || '-'}
- Occupation: ${onb.occupation || '-'}
- Desired Amount: ${onb.desiredAmount || '-'}
- Tenure (months): ${onb.tenureMonths || '-'}
- Purpose: ${onb.purpose || '-'}
- Documents Ready: ${onb.documentsReady === 'true' ? 'Yes' : onb.documentsReady === 'false' ? 'No' : '-'}
If any detail is incorrect, please tell me which one to change.`;
}

const AGENTS = [
  {
    name: 'PaymentSupportAgent',
    temp: 0.5,
    sys: `Payment Support Agent:
- Provide EMI due date & amount if asked.
- Keep answers short (<=3 sentences).
- Ask clarifying question only if required.
- If user asks to calculate EMI, request principal, rate (approx), and tenure.`,
    match: (q: string) => /\b(emi|payment|due|installment|pay|balance|amount)\b/i.test(q)
  },
  {
    name: 'CustomerOnboardingAgent',
    temp: 0.6,
    sys: `Customer Onboarding Agent:
Purpose: Collect borrower basics step-by-step for a two-wheeler or small loan.
Rules:
1. ONE question at a time.
2. Simple language for rural user; avoid jargon.
3. If user already gave a detail, do NOT ask again; move to next required field.
4. Fields to collect (in order): monthly income, occupation, desired amount, tenure months, purpose, documents readiness.
5. After all collected, provide a neat summary and ask for confirmation or corrections.
6. Use Indian Rupee context implicitly (do not ask for currency).
7. If user asks unrelated question mid-flow, briefly answer then return to next missing field.
8. If documents not ready, suggest gathering ID proof, address proof, income proof.
Tone: Helpful, respectful, concise.
Output format:
- For questions: "Step X of 6: <question>"
- For summary: start with "Summary:" then bullet list.`,
    match: (q: string) => /\b(loan|apply|application|two wheeler|bike|scooter|documents|eligibility|amount|finance)\b/i.test(q)
  },
  {
    name: 'GrievanceAgent',
    temp: 0.6,
    sys: `Grievance Agent:
- Be empathetic.
- Ask for issue description, product type, date of issue.
- Generate reference code TVS-COMP-#### when enough detail.
- If user expresses distress, acknowledge and reassure.`,
    match: (q: string) => /\b(complaint|issue|problem|not working|trouble|wrong|error|fault|damaged)\b/i.test(q)
  },
  {
    name: 'GeneralSupportAgent',
    temp: 0.7,
    sys: `General Support Agent:
- Provide helpful concise answers.
- If query is domain-specific (payments, onboarding, grievance), gently steer user to provide needed details.`,
    match: (_q: string) => true
  }
];

function pickAgent(q: string) { return AGENTS.find(a => a.match(q))!; }
function ensure(sessionId: string) {
  if (!store.has(sessionId)) store.set(sessionId, { history: [] });
  return store.get(sessionId)!;
}
function systemBlock(base: string, ctx: CustomerContext) {
  const c = ctx.customerContext;
  return `${base}

Customer:
- Name: ${c.name}
- LanguagePref: ${c.language}
- LoanStatus: ${c.loanStatus}
- NextEMIDue: ${c.emiDueDate || 'Unknown'}
- NextEMIAmount: ₹${c.emiAmount || 0}

Guidelines:
- Default to English unless user switches.
- Max 3 sentences per paragraph.
- Only one follow-up question at a time.
`;
}
async function callGeminiOnce(apiKey: string, model: string, payload: any): Promise<string> {
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    // Optional: you could add a timeout with AbortController if needed
  });
  if (!resp.ok) {
    const errText = await resp.text();
    log({ level: 'error', msg: 'llm_attempt_fail_http', model, status: resp.status, bodySnippet: errText.slice(0,180) });
    throw new Error(`HTTP ${resp.status} ${errText.slice(0,200)}`);
  }
  const json = await resp.json();
  const parts = json?.candidates?.[0]?.content?.parts;
  if (!parts || !Array.isArray(parts) || parts.length === 0) {
    log({ level: 'warn', msg: 'llm_empty_candidate', model });
    return 'I am momentarily unable to produce a full answer.';
  }
  return parts.map((p: any) => p.text || '').join('\n').trim();
}

async function callGemini(
  apiKey: string,
  sysInstr: string,
  history: ConversationMessage[],
  userInput: string,
  temperature: number
): Promise<{ text: string; modelUsed: string }> {
  const contents = [...history, { role: 'user', parts: [{ text: userInput }] }];
  const body = {
    system_instruction: { parts: [{ text: sysInstr }] },
    contents,
    generationConfig: { temperature, maxOutputTokens: 800 }
  };
  let lastErr: any;
  for (const model of healthyModels) {
    try {
      const t0 = performance.now();
      const text = await callGeminiOnce(apiKey, model, body);
      const latency = Math.round(performance.now() - t0);
      log({ level: 'info', msg: 'llm_success', model, latencyMs: latency });
      return { text, modelUsed: model };
    } catch (e: any) {
      log({ level: 'warn', msg: 'llm_model_fail', model, error: e.message?.slice(0,180) });
      lastErr = e;
      healthyModels = healthyModels.filter(m => m !== model);
    }
  }
  healthyModels = [...MODEL_PREFERENCE];
  throw lastErr || new Error('All models failed');
}
function escalation(text: string) { return new RegExp(`\\b(${ESCALATION_KEYWORDS.join('|')})\\b`, 'i').test(text); }
function nextAction(agent: string, q: string) {
  const l = q.toLowerCase();
  if (agent === 'PaymentSupportAgent' && (l.includes('emi') || l.includes('due'))) return 'fetch_payment_info';
  if (agent === 'CustomerOnboardingAgent' && (l.includes('loan') || l.includes('apply'))) return 'initiate_loan_application';
  if (agent === 'GrievanceAgent' && (l.includes('urgent') || l.includes('fraud'))) return 'escalate_to_human';
  return undefined;
}
function detectToolDirective(text: string) {
  // Pattern: <tool:name { "arg":"value" }>
  const m = text.match(/<tool:(\w+)\s*(\{.*?\})?>/);
  if (!m) return null;
  return { name: m[1], args: m[2] ? safeJSON(m[2]) : {} };
}
function safeJSON(s: string) { try { return JSON.parse(s); } catch { return {}; } }
export async function processUserQueryREST(
  sessionId: string,
  query: string,
  ctx: CustomerContext
): Promise<AgentResponse> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');
  if (circuitOpen()) {
    log({ level: 'warn', msg: 'circuit_open', sessionId });
    return { message: 'System is recovering from temporary errors. Please retry shortly.', agent: 'GeneralSupportAgent', confidence: 0.2, requiresEscalation: false };
  }
  const sess = ensure(sessionId);
  const { name, temp, sys } = pickAgent(query);
  const sysBlock = systemBlock(sys, ctx);

  // Onboarding extraction BEFORE LLM call (to shorten needed context)
  if (name === 'CustomerOnboardingAgent') {
    const onb = initOnboarding(sess);
    extractOnboarding(onb, query);
  }

  if (sess.history.length > SUMMARIZE_AFTER) {
    try {
      const toSummarize = sess.history.slice(0, sess.history.length - 4);
      const summaryPrompt = 'Summarize the following dialogue succinctly retaining key facts (EMI amounts, loan intent, complaints):\n' +
        toSummarize.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.parts.map(p=>p.text).join(' ')}`).join('\n');
      const summaryCallHistory: ConversationMessage[] = [];
      const { text: summary } = await callGemini(key, 'You are a concise summarizer.', summaryCallHistory, summaryPrompt, 0.3);
      sess.summary = summary;
      const recent = sess.history.slice(-4);
      sess.history = [{ role: 'user', parts: [{ text: `Conversation Summary: ${summary}` }] }, ...recent];
      log({ level: 'info', msg: 'history_summarized', sessionId, newLen: sess.history.length });
    } catch (e:any) {
      log({ level: 'warn', msg: 'summary_fail', error: e.message?.slice(0,120) });
    }
  }
  try {
    const { text: reply, modelUsed } = await callGemini(key, sysBlock, sess.history, query, temp);
    sess.history.push({ role: 'user', parts: [{ text: query }] });
    sess.history.push({ role: 'model', parts: [{ text: reply }] });
    sess.lastAgent = name;
    if (sess.history.length > MAX_HISTORY_MESSAGES) {
      sess.history.splice(1, sess.history.length - MAX_HISTORY_MESSAGES);
    }
    consecutiveFailures = 0;

    const tool = detectToolDirective(reply);
    let finalMessage = reply;
    if (tool) {
      const toolResult = await runTool(tool.name, tool.args, ctx);
      finalMessage = reply.replace(/<tool:.*?>/, `\n\n[Tool ${tool.name} Result]: ${JSON.stringify(toolResult.data)}`);
    }

    // Post-processing for onboarding
    if (name === 'CustomerOnboardingAgent') {
      const onb = initOnboarding(sess);
      // Extract from AI reply too (sometimes model echoes user answers structured)
      extractOnboarding(onb, finalMessage);

      if (!onb.completed) {
        const { stepIndex, question } = nextOnboardingQuestion(onb);
        if (question && onb.lastAsked !== question) {
          onb.lastAsked = question;
          finalMessage = `Step ${stepIndex + 1} of ${ONBOARDING_STEPS.length}: ${question}`;
        }
      } else if (!onb.lastAsked?.startsWith('Summary:')) {
        onb.lastAsked = 'Summary:';
        finalMessage = `Summary:\n${formatOnboardingSummary(onb)}\nPlease confirm if this is correct.`;
      }
    }

    return {
      message: finalMessage, // removed metadata footer
       agent: name,
       nextAction: nextAction(name, query),
       confidence: 0.9,
       requiresEscalation: escalation(finalMessage)
    };
  } catch (e) {
    log({ level: 'error', msg: 'llm_total_fail', error: (e as any).message?.slice(0,200) });
    consecutiveFailures += 1;
    if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) breakerOpenedAt = Date.now();
    const devHint = process.env.NODE_ENV !== 'production' ? ` (dev hint: ${(e as any).message?.slice(0,120)})` : '';
    return {
      message: 'Temporary generation issue. Please retry.' + devHint, // no footer appended
       agent: name,
       confidence: 0.4,
       requiresEscalation: false
    };
  }
}
async function runTool(name: string, args: any, ctx: CustomerContext) {
  switch (name) {
    case 'emiInfo':
      return { ok: true, data: { amount: ctx.customerContext.emiAmount, due: ctx.customerContext.emiDueDate } };
    case 'createComplaint':
      return { ok: true, data: { reference: `TVS-COMP-${Date.now().toString().slice(-4)}`, category: args?.category || 'general' } };
    case 'calcEmi': {
      const p = Number(args?.principal);
      const annual = Number(args?.annualRate);
      const months = Number(args?.months);
      if (!p || !annual || !months) {
        return { ok: false, data: { error: 'invalid_parameters' } };
      }
      const r = (annual / 100) / 12;
      const pow = Math.pow(1 + r, months);
      const emi = p * r * pow / (pow - 1);
      const total = emi * months;
      const interest = total - p;
      return {
        ok: true,
        data: {
          principal: p,
          annualRate: annual,
          months,
          monthlyEmi: Math.round(emi),
          totalInterest: Math.round(interest),
          totalPayable: Math.round(total)
        }
      };
    }
    default:
      return { ok:false, data:{ error:'unknown_tool' } };
  }
}
export function resetSession(sessionId: string) {
  store.delete(sessionId);
}