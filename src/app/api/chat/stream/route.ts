import { NextRequest } from 'next/server';
import { processUserQueryREST } from '../../../../lib/gemini-wrapper';
import { log } from '../../../../lib/logging';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { message, sessionId, language, customerContext } = await req.json();
  if (!message || !sessionId) {
    return new Response('Missing message/sessionId', { status: 400 });
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

  const t0 = Date.now();
  let result;
  try {
    result = await processUserQueryREST(sessionId, message, ctx);
  } catch (e: any) {
    return new Response('Error: ' + (e.message || 'unknown'), { status: 500 });
  }
  const latency = Date.now() - t0;
  log({ level: 'info', msg: 'chat_turn_stream', sessionId, agent: result.agent, latencyMs: latency });

  // Tokenize (simple split) – could be improved with sentence/word streaming
  const tokens = result.message.split(/(\s+)/).filter(t => t.length);

  const encoder = new TextEncoder();
  let i = 0;

  const stream = new ReadableStream({
    start(controller) {
      // Send meta block first
      const meta = {
        agent: result.agent,
        nextAction: result.nextAction,
        confidence: result.confidence,
        requiresEscalation: result.requiresEscalation
      };
      controller.enqueue(encoder.encode(`__META_START__${JSON.stringify(meta)}__META_END__`));

      const push = () => {
        if (i >= tokens.length) {
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(tokens[i]));
        i++;
        setTimeout(push, 18); // pace
      };
      push();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}