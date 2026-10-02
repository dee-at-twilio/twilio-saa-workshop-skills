// ConversationRelay — silence re-prompt when the caller pauses mid-flow.
// After each agent turn, arm a per-call silence timer. If the caller
// doesn't produce a `prompt` before it fires, send a gentle re-ask for
// the current field. Any inbound `prompt`, `dtmf`, or `interrupt` event
// should clear the timer.

import type { WebSocket } from 'ws';

const SILENCE_MS = 6000;
const timers = new Map<string, NodeJS.Timeout>();

export function armSilenceTimer(socket: WebSocket, callSid: string, currentField: string) {
  clearSilenceTimer(callSid);
  timers.set(callSid, setTimeout(() => {
    socket.send(JSON.stringify({
      type: 'text',
      token: `Are you still there? I just need your ${currentField}.`,
      last: true,
    }));
  }, SILENCE_MS));
}

export function clearSilenceTimer(callSid: string) {
  clearTimeout(timers.get(callSid));
  timers.delete(callSid);
}
