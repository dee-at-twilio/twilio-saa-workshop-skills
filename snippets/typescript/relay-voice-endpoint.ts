// ConversationRelay — inbound voice TwiML endpoint (baseline).
// Returns the TwiML that connects the incoming call to a ConversationRelay
// WebSocket server. Use as the starting point for any ConversationRelay
// integration; layer provider/model tuning on top via relay-flux-config.ts.

import { twiml as TwiML } from 'twilio';
import { app } from './server';

const { VoiceResponse } = TwiML;

app.post('/voice/incoming', (req, res) => {
  const twiml = new VoiceResponse();
  const connect = twiml.connect();

  connect.conversationRelay({
    url: process.env.RELAY_WS_URL,
    welcomeGreeting: 'Thanks for calling — how can I help you today?',
  });

  res.type('text/xml').send(twiml.toString());
});
