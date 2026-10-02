// Fetch ConversationRelay runtime events from Voice Insights.
// GET /v1/Voice/Calls/{callSid}/Events returns the full event stream for the
// call; CR-specific event names cover prompt_sent, token-received, STT/TTS
// latency, and speech-boundary markers. Useful for post-call turn-by-turn
// inspection and latency dashboards.

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

export const CR_EVENT_NAMES = new Set([
  'prompt_sent',
  'first_token_received',
  'final_token_received',
  'stt_latency',
  'tts_latency',
  'start_of_customer_speech',
  'end_of_customer_speech',
  'start_of_agent_speech',
  'end_of_agent_speech',
  'interrupt',
  'configurations',
  'call_wrap_up',
]);

interface InsightsEvent {
  name?: string;
  sequence_number?: number;
  timestamp?: string;
  event_data?: { latency_ms?: number };
  latency_ms?: number;
}

export async function fetchCrEvents(callSid: string): Promise<InsightsEvent[]> {
  const url = `https://insights.twilio.com/v1/Voice/Calls/${callSid}/Events`;
  const resp = await fetch(url, { headers: { Authorization: authHeader } });
  if (!resp.ok) return [];
  const body = (await resp.json()) as { events?: InsightsEvent[] };
  return (body.events ?? []).filter((e) => e.name && CR_EVENT_NAMES.has(e.name));
}

export function summarizeLatencies(events: InsightsEvent[]): {
  avgSttMs: number;
  avgTtsMs: number;
  sttSamples: number;
  ttsSamples: number;
} {
  const latenciesFor = (name: string): number[] =>
    events
      .filter((e) => e.name === name)
      .map((e) => e.event_data?.latency_ms ?? e.latency_ms)
      .filter((v): v is number => typeof v === 'number');

  const stt = latenciesFor('stt_latency');
  const tts = latenciesFor('tts_latency');
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

  return {
    avgSttMs: avg(stt),
    avgTtsMs: avg(tts),
    sttSamples: stt.length,
    ttsSamples: tts.length,
  };
}
