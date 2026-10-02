// ConversationRelay — accept DTMF as a fallback for structured intake.
// `dtmf` messages arrive one digit at a time. Buffer them into the
// current field and submit once the expected length is reached.
// Sizing: 10 digits for a US phone, 8 for a DOB in MMDDYYYY form.

import { submitFieldFromDtmf } from './intakeState';

const buffers = new Map<string, string>();
const EXPECTED = { phone: 10, dob: 8 } as const;

export function onDtmf(callSid: string, digit: string, currentField: keyof typeof EXPECTED | null) {
  if (!currentField) return;
  const next = (buffers.get(callSid) ?? '') + digit;
  buffers.set(callSid, next);

  if (next.length === EXPECTED[currentField]) {
    submitFieldFromDtmf(callSid, currentField, next);
    buffers.delete(callSid);
  }
}
