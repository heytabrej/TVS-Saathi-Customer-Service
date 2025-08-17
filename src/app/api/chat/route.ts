import { NextRequest, NextResponse } from 'next/server';
import { processUserQueryREST } from '../../../lib/gemini-wrapper';
import { log } from '../../../lib/logging';

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, language, customerContext } = await req.json();
    if (!message || !sessionId) {
      return NextResponse.json({ error: 'message and sessionId required' }, { status: 400 });
    }
    const ctx = {
      customerId: customerContext?.customerId || 'anonymous',
      customerContext: {
        name: customerContext?.name || 'Customer',
        language: language || customerContext?.language || 'en',
        loanStatus: customerContext?.loanStatus || 'unknown',
        emiDueDate: customerContext?.emiDueDate || '',
        emiAmount: customerContext?.emiAmount || 0
      }
    };
  const t0 = performance.now();
  const r = await processUserQueryREST(sessionId, message, ctx);
  const latency = Math.round(performance.now() - t0);
  log({ level: 'info', msg: 'chat_turn', sessionId, agent: r.agent, latencyMs: latency, nextAction: r.nextAction });
  return NextResponse.json(r);
  } catch (e: any) {
  log({ level: 'error', msg: 'chat_route_error', error: e.message?.slice(0,200) });
    return NextResponse.json({
      message: 'Service temporarily unavailable. Try again.',
      agent: 'GeneralSupportAgent'
    }, { status: 200 });
  }
}