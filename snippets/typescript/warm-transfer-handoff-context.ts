// Warm transfer — build the handoff context that rides on the agent's
// leg via Twilio's native custom-parameter mechanism.
//
// Do NOT invent a "push to agent desktop" library. Twilio already ships
// this data through `To=client:{id}?key=value&...` on the outbound call,
// where each pair arrives as a custom parameter on the incoming call in
// the agent's Voice SDK.
//
// Guideline: keep the combined payload under ~800 bytes. Send references
// (SIDs, IDs), not payloads — no full transcripts.

import { callStateStore } from './callState';
import type { HandoffDecision } from './detectHandoff';

export type HandoffParams = {
  callSid: string;
  reason: string;
  matchKind: 'match' | 'no-match' | 'ambiguous' | 'transfer' | 'none';
  patientId?: string;
  lastCallerUtterance?: string;
};

export function buildHandoffParams(callSid: string, decision: HandoffDecision): HandoffParams {
  const state = callStateStore.get(callSid);
  const last = state.transcript.at(-1);
  return {
    callSid,
    reason: decision.reason,
    matchKind: state.lastMatchResult?.kind ?? 'none',
    patientId: state.lastMatchResult?.kind === 'match' ? state.lastMatchResult.patientId : undefined,
    lastCallerUtterance: last?.text?.slice(0, 200),
  };
}

export function encodeHandoffParams(p: HandoffParams): string {
  const entries = Object.entries(p).filter(([, v]) => v != null) as [string, string][];
  return new URLSearchParams(entries).toString();
}
