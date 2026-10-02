// ConversationRelay — bridge LLM tool calls to an existing agent's tools.
// Route each named tool call to the customer's existing implementation
// and feed the structured result back into the same agent turn.

import { existingAgentRuntime, existingTools } from '@customer/agent-runtime';

export type ToolCall = { name: string; args: Record<string, unknown> };

export async function routeToExistingAgent(callSid: string, utterance: string) {
  const result = await existingAgentRuntime.handleTurn(callSid, utterance);

  if (result.toolCall) {
    const toolResult = await invokeExistingTool(result.toolCall);
    return existingAgentRuntime.continueWithToolResult(callSid, toolResult);
  }

  return result;
}

async function invokeExistingTool(call: ToolCall) {
  switch (call.name) {
    case 'matchPatient':        return existingTools.matchPatient(call.args);
    case 'searchAvailability':  return existingTools.searchAvailability(call.args);
    case 'scheduleAppointment': return existingTools.scheduleAppointment(call.args);
    case 'transferCall':        return existingTools.transferCall(call.args);
    default: throw new Error(`Unrecognized tool: ${call.name}`);
  }
}
