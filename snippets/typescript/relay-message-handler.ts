// ConversationRelay — WebSocket message handler.
// Reads ConversationRelay's setup/prompt/interrupt/dtmf messages and
// routes prompts to an existing agent runtime.

import { WebSocketServer } from 'ws';
import { existingAgentRuntime } from '@customer/agent-runtime';
import { routeToExistingAgent } from './toolBridge';
import { sendAgentResponse } from './sendAgentResponse';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket) => {
  let callSid: string;

  socket.on('message', async (raw) => {
    const message = JSON.parse(raw.toString());

    switch (message.type) {
      case 'setup':
        callSid = message.callSid;
        break;

      case 'prompt':
        const reply = await routeToExistingAgent(callSid, message.voicePrompt);
        sendAgentResponse(socket, reply);
        break;

      case 'interrupt':
        existingAgentRuntime.cancelInFlightResponse(callSid);
        break;
    }
  });
});
