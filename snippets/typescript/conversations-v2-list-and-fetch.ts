// List and fetch Conversations via the Conversation Orchestrator v2 API.
// Uses the twilio Node SDK's v2 Conversations resource (orchestrator-backed).
// For low-level needs, swap to a raw fetch against conversations.twilio.com/v2.

import { Twilio } from 'twilio';

const client = new Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function listConversations(status?: string, limit = 20) {
  // The v2 endpoint uses the SDK's conversations.v2.conversations.list surface.
  return client.conversations.v2.conversations.list({
    ...(status ? { status } : {}),
    limit,
  });
}

export async function fetchConversation(conversationId: string) {
  return client.conversations.v2.conversations(conversationId).fetch();
}
