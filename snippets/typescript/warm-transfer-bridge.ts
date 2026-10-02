// Warm transfer — bridge caller and human agent through a Conference,
// with the handoff context attached to the agent's leg via Twilio's
// native custom-parameter mechanism.
//
// Flow:
//   1. Move the caller into a Conference (hold music via waitUrl).
//   2. Dial the agent into the same Conference. Encode the handoff
//      params from buildHandoffParams onto `To=client:{id}?...`.
//   3. A <Say> announce plays on the agent's leg before they join
//      the caller's audio.

import Twilio from 'twilio';
import { TWILIO_NUMBER, AGENT_IDENTITY } from './config';
import { briefing } from './agentRouting';
import { buildHandoffParams, encodeHandoffParams } from './handoffContext';
import type { HandoffDecision } from './detectHandoff';

const twilio = Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function bridgeToAgent(callSid: string, decision: HandoffDecision) {
  const conf = `warm-${callSid}`;

  await twilio.calls(callSid).update({
    twiml: `<Response><Dial><Conference waitUrl="/hold">${conf}</Conference></Dial></Response>`,
  });

  const params = buildHandoffParams(callSid, decision);
  const to = `client:${AGENT_IDENTITY}?${encodeHandoffParams(params)}`;

  await twilio.calls.create({
    to,
    from: TWILIO_NUMBER,
    twiml: `<Response><Say>${briefing(decision)}</Say><Dial><Conference>${conf}</Conference></Dial></Response>`,
  });
}
