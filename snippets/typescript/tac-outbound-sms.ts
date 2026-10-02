// Outbound SMS via Twilio Agent Connect (TypeScript SDK).
//
// Install: npm install twilio-agent-connect
// Verified against the official outbound example at:
//   github.com/twilio/twilio-agent-connect-typescript/tree/main/getting_started/examples/outbound
//
// TAC.create() is async. Build the channel, register it on the TAC instance,
// then call initiateOutboundConversation({ to, message }). TACServer must be
// started so the inbound reply webhook / WebSocket routes are registered
// before the outbound send — otherwise the first reply has nowhere to land.

import { TAC, TACConfig, SMSChannel, TACServer } from 'twilio-agent-connect';

export async function sendOutboundSms(to: string, message: string): Promise<string> {
  const tac = await TAC.create({ config: TACConfig.fromEnv() });
  const smsChannel = new SMSChannel(tac);
  tac.registerChannel(smsChannel);

  const server = new TACServer(tac);
  await server.start();

  const result = await smsChannel.initiateOutboundConversation({ to, message });
  return result.conversationId as string;
}
