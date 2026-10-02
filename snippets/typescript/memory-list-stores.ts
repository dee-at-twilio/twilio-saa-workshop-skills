// List all Conversation Memory stores on the account.
//
// GET /v1/ControlPlane/Stores returns the store list. In some responses
// stores arrive as bare ID strings instead of objects; fetch the detail
// page for each one in that case so the caller always sees uniform objects.

const MEMORY_BASE = 'https://memory.twilio.com/v1';
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

interface Store {
  id: string;
  displayName?: string;
  [k: string]: unknown;
}

export async function listStores(): Promise<Store[]> {
  const resp = await fetch(`${MEMORY_BASE}/ControlPlane/Stores?pageSize=50`, {
    headers: { Authorization: authHeader },
  });
  if (!resp.ok) throw new Error(`List stores failed: ${resp.status} ${await resp.text()}`);
  const body = (await resp.json()) as { stores?: Array<Store | string> };

  const stores: Store[] = [];
  for (const s of body.stores ?? []) {
    if (typeof s === 'object' && s !== null) {
      stores.push(s);
      continue;
    }
    const detail = await fetch(`${MEMORY_BASE}/ControlPlane/Stores/${s}`, {
      headers: { Authorization: authHeader },
    });
    stores.push(detail.ok ? ((await detail.json()) as Store) : { id: s });
  }
  return stores;
}
