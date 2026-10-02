// Outbound call with Answering Machine Detection + ConversationRelay.
// calls.create with inline TwiML that wraps ConversationRelay in a <Connect>
// verb, record="true" for compliance recording, and async AMD so the call
// connects while detection runs in parallel. The AMD result posts to
// asyncAmdStatusCallback.

import { Twilio, twiml as TwiML } from 'twilio';

const client = new Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
const fromNumber = process.env.TWILIO_PHONE_NUMBER!;
const publicDomain = process.env.TWILIO_VOICE_PUBLIC_DOMAIN!;
const convConfig = process.env.TWILIO_CONVERSATION_CONFIGURATION_ID!;

export async function placeAmdCall(args: {
  to: string;
  welcomeGreeting: string;
  voice?: string;
  language?: string;
  transcriptionLanguage?: string;
}): Promise<string> {
  const websocketUrl = `wss://${publicDomain}/ws`;
  const actionUrl = `https://${publicDomain}/conversation-relay-callback`;
  const amdStatusCallback = `https://${publicDomain}/amd-status`;

  const response = new TwiML.VoiceResponse();
  const connect = response.connect({ action: actionUrl });
  connect.conversationRelay({
    url: websocketUrl,
    welcomeGreeting: args.welcomeGreeting,
    welcomeGreetingInterruptible: true,
    voice: args.voice ?? 'en-US-Neural2-F',
    language: args.language ?? 'en-US',
    transcriptionLanguage: args.transcriptionLanguage ?? 'en-US',
    conversationConfiguration: convConfig,
  });

  const call = await client.calls.create({
    to: args.to,
    from: fromNumber,
    twiml: response.toString(),
    record: true,
    machineDetection: 'Enable',
    asyncAmd: 'true',
    asyncAmdStatusCallback: amdStatusCallback,
    asyncAmdStatusCallbackMethod: 'POST',
  });

  return call.sid;
}
