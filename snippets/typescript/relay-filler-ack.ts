// ConversationRelay — filler acknowledgement while the agent thinks.
// The instant a `prompt` message arrives, send a short filler `text`
// so the caller hears acknowledgement immediately, then start the LLM /
// tool call in parallel. Rotate fillers so it doesn't sound canned.

import type { WebSocket } from 'ws';
import { routeToExistingAgent } from './toolBridge';

export type PromptEvent = { voicePrompt: string; lang: string; last: boolean };

const FILLERS = ['Okay', 'Mm-hm', 'Got it', 'One moment'];
const fillerCursors = new Map<string, number>();

function fillerIndex(callSid: string) {
  const next = ((fillerCursors.get(callSid) ?? -1) + 1) % FILLERS.length;
  fillerCursors.set(callSid, next);
  return next;
}

export async function onPrompt(socket: WebSocket, callSid: string, event: PromptEvent) {
  const filler = FILLERS[fillerIndex(callSid)];
  socket.send(JSON.stringify({ type: 'text', token: filler + '. ', last: true }));

  const reply = await routeToExistingAgent(callSid, event.voicePrompt);
  socket.send(JSON.stringify({ type: 'text', token: reply.text, last: true }));
}
