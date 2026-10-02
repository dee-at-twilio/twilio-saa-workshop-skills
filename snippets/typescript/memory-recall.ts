// Recall observations, summaries, and communications for a Memory profile.
//
// POST /v1/Stores/{storeId}/Profiles/{profileId}/Recall returns three
// parallel lists, each with its own limit. Passing a query runs a hybrid
// semantic/lexical search; leaving it blank uses query expansion over the
// previous 10 communications in a conversation. A conversationId scopes
// recall to that one conversation.

const MEMORY_BASE = 'https://memory.twilio.com/v1';
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

export interface RecallOptions {
  storeId: string;
  profileId: string;
  query?: string;
  conversationId?: string;
  observationsLimit?: number;
  summariesLimit?: number;
  communicationsLimit?: number;
  beginDate?: string;
  endDate?: string;
  relevanceThreshold?: number;
}

export interface RecallResult {
  observations: unknown[];
  summaries: unknown[];
  communications: unknown[];
}

export async function recall(opts: RecallOptions): Promise<RecallResult> {
  const body: Record<string, unknown> = {
    observationsLimit: opts.observationsLimit ?? 10,
    summariesLimit: opts.summariesLimit ?? 5,
    communicationsLimit: opts.communicationsLimit ?? 5,
  };
  if (opts.query) body.query = opts.query;
  if (opts.conversationId) body.conversationId = opts.conversationId;
  if (opts.beginDate) body.beginDate = opts.beginDate;
  if (opts.endDate) body.endDate = opts.endDate;
  if (opts.relevanceThreshold != null) body.relevanceThreshold = opts.relevanceThreshold;

  const resp = await fetch(
    `${MEMORY_BASE}/Stores/${opts.storeId}/Profiles/${opts.profileId}/Recall`,
    {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!resp.ok) throw new Error(`Recall failed: ${resp.status} ${await resp.text()}`);
  return resp.json() as Promise<RecallResult>;
}
