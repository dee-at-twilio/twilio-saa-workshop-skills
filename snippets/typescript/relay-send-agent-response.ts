// ConversationRelay — send an agent reply back over the WebSocket.
// Wraps the reply in the `text` message shape ConversationRelay expects
// for TTS. Set last=true to end the turn; use non-last chunks for
// streaming.

import type { WebSocket } from 'ws';

export type AgentReply = { text: string };

export function sendAgentResponse(socket: WebSocket, reply: AgentReply) {
  socket.send(JSON.stringify({
    type: 'text',
    token: reply.text,
    last: true,
  }));
}
