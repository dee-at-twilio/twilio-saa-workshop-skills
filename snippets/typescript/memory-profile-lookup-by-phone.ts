// Resolve a Conversation Memory profile ID from an E.164 phone number.
//
// POST /v1/Stores/{storeId}/Profiles/Lookup normalizes the phone number
// and returns matching profile IDs. The response normalizedValue is useful
// for display/logging. A caller may match multiple profiles; the first is
// the usual pick, but callers should decide.

const MEMORY_BASE = 'https://memory.twilio.com/v1';
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

export interface ProfileLookupResult {
  profiles: string[];
  normalizedValue?: string;
}

export async function lookupProfileByPhone(storeId: string, phone: string): Promise<ProfileLookupResult> {
  const resp = await fetch(`${MEMORY_BASE}/Stores/${storeId}/Profiles/Lookup`, {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ idType: 'phone', value: phone }),
  });
  if (!resp.ok) throw new Error(`Profile lookup failed: ${resp.status} ${await resp.text()}`);
  return resp.json() as Promise<ProfileLookupResult>;
}
