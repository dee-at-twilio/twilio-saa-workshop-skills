// Outbound voice call via Twilio Agent Connect (TypeScript SDK).
//
// Install: npm install twilio-agent-connect
// Verified against the official outbound example at:
//   github.com/twilio/twilio-agent-connect-typescript/tree/main/getting_started/examples/outbound
//
// The TypeScript SDK uses twimlOptions to pass ConversationRelay-level
// overrides like welcomeGreeting. WebSocket URL and callback domain are
// inferred from TACConfig.fromEnv() — set TWILIO_VOICE_PUBLIC_DOMAIN and
// related variables in .env before calling.

import { TAC, TACConfig, VoiceChannel, TACServer } from 'twilio-agent-connect';

export async function placeOutboundCall(to: string, welcomeGreeting?: string): Promise<string> {
  const tac = await TAC.create({ config: TACConfig.fromEnv() });
  const voiceChannel = new VoiceChannel(tac);
  tac.registerChannel(voiceChannel);

  const server = new TACServer(tac);
  await server.start();

  const result = await voiceChannel.initiateOutboundConversation({
    to,
    ...(welcomeGreeting ? { twimlOptions: { welcomeGreeting } } : {}),
  });
  return result.callSid as string;
}
