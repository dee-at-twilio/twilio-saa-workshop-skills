// List all communications on a Conversations v2 (orchestrator-backed) conversation.
// GET /v2/Conversations/{id}/Communications returns every message/call across
// channels linked to that conversation. Optional channelId narrows to one
// channel. Response items include author (channel + address), content
// (TEXT or other types), recipients, and occurredAt.
//
// This path exists on the orchestrator-backed v2 surface via a raw fetch for
// older SDK versions; the Twilio Node SDK also exposes it via
// client.conversations.v2.communications(conversationId).list().

import { Twilio } from 'twilio';

const client = new Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function listCommunications(
  conversationId: string,
  channelId?: string,
  pageSize = 50,
) {
  return client.conversations.v2.communications(conversationId).list({
    ...(channelId ? { channelId } : {}),
    pageSize,
  });
}
