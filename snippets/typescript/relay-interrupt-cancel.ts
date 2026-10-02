// ConversationRelay — cancel in-flight generation on caller barge-in.
// When the caller starts speaking over the agent's TTS, ConversationRelay
// emits an `interrupt` message. Abort any in-flight LLM / tool-call
// promise so the next `prompt` isn't answered with a stale reply.

import type { WebSocket } from 'ws';
import { routeToExistingAgent } from './toolBridge';
import type { PromptEvent } from './fillerAck';

const inFlight = new Map<string, AbortController>();

export async function onPrompt(socket: WebSocket, callSid: string, event: PromptEvent) {
  const controller = new AbortController();
  inFlight.set(callSid, controller);
  try {
    const reply = await routeToExistingAgent(callSid, event.voicePrompt, { signal: controller.signal });
    socket.send(JSON.stringify({ type: 'text', token: reply.text, last: true }));
  } catch (err) {
    if ((err as Error).name !== 'AbortError') throw err;
  } finally {
    inFlight.delete(callSid);
  }
}

export function onInterrupt(callSid: string) {
  inFlight.get(callSid)?.abort();
}
