// Fetch outbound_api call summaries from Voice Insights, paginated.
//
// GET /v1/Voice/Summaries with direction=outbound_api and a time window.
// next_page_url already has all params embedded, so follow it without
// adding params. Each summary includes call_sid, to/from (as objects with
// phone_number/carrier), duration, call_state, start_time.

const SUMMARIES_URL = 'https://insights.twilio.com/v1/Voice/Summaries';
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

interface CallSummary {
  call_sid: string;
  to?: { phone_number?: string };
  from?: { phone_number?: string };
  duration?: number;
  call_state?: string;
  start_time?: string;
}

interface SummariesPage {
  call_summaries?: CallSummary[];
  meta?: { next_page_url?: string };
}

export async function fetchOutboundSummaries(startDt: Date, endDt: Date): Promise<CallSummary[]> {
  const calls: CallSummary[] = [];
  const initialParams = new URLSearchParams({
    startTime: startDt.toISOString().slice(0, 19) + 'Z',
    endTime: endDt.toISOString().slice(0, 19) + 'Z',
    direction: 'outbound_api',
    pageSize: '1000',
  });

  let url: string | null = `${SUMMARIES_URL}?${initialParams.toString()}`;
  while (url) {
    const resp = await fetch(url, { headers: { Authorization: authHeader } });
    if (!resp.ok) throw new Error(`Insights fetch failed: ${resp.status} ${await resp.text()}`);
    const data = (await resp.json()) as SummariesPage;
    calls.push(...(data.call_summaries ?? []));
    url = data.meta?.next_page_url ?? null;
  }
  return calls;
}
