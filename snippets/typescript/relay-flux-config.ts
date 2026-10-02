// ConversationRelay — Deepgram Flux configuration for structured intake.
// Use for journeys that need reliable collection of structured fields
// (DOB, phone, name, address, ID numbers) with natural pauses and
// canonical formatting.
//
// Why Flux for intake:
//   - partialPrompts: unfinalized transcripts, so the server can start
//     fillers or tool calls before the caller has finished speaking.
//   - eotThreshold: confidence-based end-of-turn detection, tuned for
//     natural pauses (e.g. between DOB month/day/year).
//   - deepgramSmartFormat: DOB, phone, dates arrive in canonical form.
//   - interruptSensitivity: 'medium' reduces false barge-ins during
//     repeat-back turns.

import { twiml as TwiML } from 'twilio';
import { app } from './server';

const { VoiceResponse } = TwiML;

app.post('/voice/incoming', (req, res) => {
  const twiml = new VoiceResponse();
  const connect = twiml.connect();

  connect.conversationRelay({
    url: process.env.RELAY_WS_URL,
    welcomeGreeting: 'Thanks for calling — how can I help you today?',

    transcriptionProvider: 'Deepgram',
    speechModel: 'flux',
    partialPrompts: true,
    eotThreshold: 0.8,
    deepgramSmartFormat: true,

    interruptible: 'any',
    interruptSensitivity: 'medium',
    speechTimeout: 1200,
  });

  res.type('text/xml').send(twiml.toString());
});
