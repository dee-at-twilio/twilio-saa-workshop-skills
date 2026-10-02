// Create a Conversation and add an SMS participant.
//
// Handles the common "number already in an active conversation" case: Twilio
// rejects the add with the existing Conversation SID in the error message;
// regex-extract it and reuse the existing conversation instead of creating
// a duplicate.

import { Twilio } from 'twilio';

const client = new Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
const fromNumber = process.env.TWILIO_PHONE_NUMBER!;

export async function ensureConversationWithSmsParticipant(
  to: string,
): Promise<{ conversationSid: string; createdNew: boolean }> {
  const conversation = await client.conversations.v1.conversations.create({});

  try {
    await client.conversations.v1.conversations(conversation.sid).participants.create({
      messagingBindingAddress: to,
      messagingBindingProxyAddress: fromNumber,
    });
    return { conversationSid: conversation.sid, createdNew: true };
  } catch (err) {
    const match = /Conversation (CH[a-f0-9]+)/.exec(String(err));
    if (!match) {
      await client.conversations.v1.conversations(conversation.sid).remove();
      throw err;
    }
    const existingSid = match[1];
    await client.conversations.v1.conversations(conversation.sid).remove();
    return { conversationSid: existingSid, createdNew: false };
  }
}

export async function sendMessage(
  conversationSid: string,
  author: string,
  body: string,
): Promise<string> {
  const message = await client.conversations.v1
    .conversations(conversationSid)
    .messages.create({ author, body });
  return message.sid;
}
