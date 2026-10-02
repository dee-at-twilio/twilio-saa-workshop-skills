"""Create a Conversation and add an SMS participant.

Handles the common "number already in an active conversation" case: Twilio
rejects the add with the existing Conversation SID in the error body;
regex-extract it and reuse the existing conversation instead of creating a
duplicate.
"""
import os
import re

from twilio.rest import Client


client = Client(os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])
from_number = os.environ["TWILIO_PHONE_NUMBER"]


def ensure_conversation_with_sms_participant(to: str) -> tuple[str, bool]:
    """Returns (conversation_sid, created_new). If the recipient is already
    in an active conversation, returns that one and does not create a new."""
    conversation = client.conversations.v1.conversations.create()

    try:
        client.conversations.v1.conversations(conversation.sid).participants.create(
            messaging_binding_address=to,
            messaging_binding_proxy_address=from_number,
        )
        return conversation.sid, True
    except Exception as e:
        match = re.search(r"Conversation (CH[a-f0-9]+)", str(e))
        if not match:
            client.conversations.v1.conversations(conversation.sid).delete()
            raise

        existing_sid = match.group(1)
        client.conversations.v1.conversations(conversation.sid).delete()
        return existing_sid, False


def send_message(conversation_sid: str, author: str, body: str) -> str:
    message = client.conversations.v1.conversations(conversation_sid).messages.create(
        author=author,
        body=body,
    )
    return message.sid
