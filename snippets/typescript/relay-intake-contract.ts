// ConversationRelay — LLM intake collection contract.
// Appended to the agent's system prompt. Enforces field order,
// repeat-back, correction, and single-tool-call rules for structured
// intake (DOB, name, phone). Adapt the field list per journey.

export const INTAKE_CONTRACT = `
When the caller has a scheduling intent, collect the following before calling matchPatient:
  1. date of birth (month, day, year)
  2. full name (first and last)
  3. phone number (10 digits)

For each field:
  - ask for it in one short question
  - repeat back what you heard, digit-by-digit for phone, spelled-back for name
  - if the caller says no, corrects you, or interrupts, re-ask ONLY that field
  - advance to the next field only after an explicit or implicit yes

Once all three are confirmed, call matchPatient(dob, name, phone) exactly once.
Do not ask any other questions during intake.
`;

// Companion: guidance for branching on the tool result.
// Appended to the same system prompt (or delivered as a follow-on).
export const ON_MATCH_RESULT_GUIDANCE = `
After matchPatient returns, do exactly one of the following:

- match       → confirm the patient by first name and proceed to scheduling
- no-match    → apologise briefly, then re-ask ONE field the caller
                is most likely to have misheard (usually phone)
- ambiguous   → ask a single disambiguating question drawn from the
                candidates (e.g. "Are you the John Smith born in April
                or in August?")
- transfer    → call transferCall(reason) — do not attempt to schedule
`;
