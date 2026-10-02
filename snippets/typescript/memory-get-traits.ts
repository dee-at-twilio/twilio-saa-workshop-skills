// Fetch all traits on a Conversation Memory profile, grouped by traitGroup.
//
// GET /v1/Stores/{storeId}/Profiles/{profileId}/Traits returns a flat list;
// traits carry a traitGroup field so callers typically fold them into
// { group: { name: value } } for display or for passing into an LLM system
// prompt.

const MEMORY_BASE = 'https://memory.twilio.com/v1';
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

interface Trait {
  name: string;
  value: unknown;
  traitGroup?: string;
}

export async function getTraitsGrouped(
  storeId: string,
  profileId: string,
): Promise<Record<string, Record<string, unknown>>> {
  const resp = await fetch(
    `${MEMORY_BASE}/Stores/${storeId}/Profiles/${profileId}/Traits?pageSize=200`,
    { headers: { Authorization: authHeader } },
  );
  if (!resp.ok) throw new Error(`Fetch traits failed: ${resp.status} ${await resp.text()}`);
  const body = (await resp.json()) as { items?: Trait[] };

  const grouped: Record<string, Record<string, unknown>> = {};
  for (const t of body.items ?? []) {
    const group = t.traitGroup ?? 'default';
    (grouped[group] ??= {})[t.name] = t.value;
  }
  return grouped;
}
