"""Outbound call with Answering Machine Detection + ConversationRelay.

Calls.create with inline TwiML that wraps ConversationRelay in a <Connect>
verb, record="true" for compliance recording, and async AMD so the call
connects while detection runs in parallel. The AMD result posts to
async_amd_status_callback.
"""
import os

from twilio.rest import Client
from twilio.twiml.voice_response import Connect, VoiceResponse


account_sid = os.environ["TWILIO_ACCOUNT_SID"]
auth_token = os.environ["TWILIO_AUTH_TOKEN"]
from_number = os.environ["TWILIO_PHONE_NUMBER"]
public_domain = os.environ["TWILIO_VOICE_PUBLIC_DOMAIN"]
conv_config = os.environ["TWILIO_CONVERSATION_CONFIGURATION_ID"]

client = Client(account_sid, auth_token)


def place_amd_call(
    to: str,
    welcome_greeting: str,
    voice: str = "en-US-Neural2-F",
    language: str = "en-US",
    transcription_language: str = "en-US",
) -> str:
    websocket_url = f"wss://{public_domain}/ws"
    action_url = f"https://{public_domain}/conversation-relay-callback"
    amd_status_callback = f"https://{public_domain}/amd-status"

    response = VoiceResponse()
    connect = Connect(action=action_url)
    connect.conversation_relay(
        url=websocket_url,
        welcome_greeting=welcome_greeting,
        welcomeGreetingInterruptible=True,
        voice=voice,
        language=language,
        transcription_language=transcription_language,
        conversation_configuration=conv_config,
    )
    response.append(connect)

    call = client.calls.create(
        to=to,
        from_=from_number,
        twiml=str(response),
        record="true",
        machine_detection="Enable",
        async_amd="true",
        async_amd_status_callback=amd_status_callback,
        async_amd_status_callback_method="POST",
    )
    return call.sid
