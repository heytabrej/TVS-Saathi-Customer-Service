import { processUserQueryREST, type CustomerContext } from './gemini-wrapper';

// Tool registry
interface ToolResult { name: string; output: any; }
type Tool = (args: any, ctx: CustomerContext) => Promise<ToolResult>;

const tools: Record<string, Tool> = {
  fetchEmiInfo: async (_args, ctx) => ({
    name: 'fetchEmiInfo',
    output: {
      amount: ctx.customerContext.emiAmount,
      dueDate: ctx.customerContext.emiDueDate
    }
  }),
  createComplaint: async (args, _ctx) => {
    const ref = `TVS-COMP-${Math.floor(Math.random()*9000+1000)}`;
    return { name: 'createComplaint', output: { reference: ref, category: args?.category || 'general' } };
  }
};

export async function orchestrate(sessionId: string, userQuery: string, ctx: CustomerContext) {
  // Phase 1: lightweight classification (placeholder – could be a smaller prompt/model)
  // For now reuse existing route (improve later)
  const aiResp = await processUserQueryREST(sessionId, userQuery, ctx);

  // Detect tool intention (simple pattern, replace with JSON function call convention)
  const toolMatch = aiResp.message.match(/<tool:(\w+)\s*(\{.*?\})?>/);
  if (toolMatch) {
    const toolName = toolMatch[1];
    const rawArgs = toolMatch[2];
    if (tools[toolName]) {
      const args = rawArgs ? JSON.parse(rawArgs) : {};
      const result = await tools[toolName](args, ctx);
      // Re-inject tool result into a follow-up generation (not shown)
      aiResp.message = aiResp.message.replace(toolMatch[0], `Tool ${result.name} result: ${JSON.stringify(result.output)}`);
      aiResp.nextAction = `tool_${result.name}_completed`;
    }
  }
  return aiResp;
}