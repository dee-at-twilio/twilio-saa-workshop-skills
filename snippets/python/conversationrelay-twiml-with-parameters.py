"""Build <Connect><ConversationRelay> TwiML with custom <Parameter> children.

Twilio delivers each parameter as a `customParameters` field in the `setup`
WebSocket message to your app — the native-mechanism way to ship context
(session_id, role, caller metadata) to the server without a side-channel.
"""
import os

from twilio.twiml.voice_response import Connect, ConversationRelay, VoiceResponse


ELEVENLABS_VOICE_ID = os.environ["ELEVENLABS_VOICE_ID"]
CONVERSATION_CONFIGURATION_ID = os.environ["TWILIO_CONVERSATION_CONFIGURATION_ID"]


def build_conversationrelay_twiml_with_params(
    ws_url: str,
    greeting: str,
    extra_params: dict[str, str],
) -> str:
    vr = VoiceResponse()
    connect = Connect()
    cr = ConversationRelay(
        url=ws_url,
        welcome_greeting=greeting,
        language="multi",
        transcription_language="multi",
        tts_language="multi",
        tts_provider="ElevenLabs",
        voice=ELEVENLABS_VOICE_ID,
        transcription_provider="Deepgram",
        speech_model="nova-3-general",
        conversation_configuration=CONVERSATION_CONFIGURATION_ID,
    )
    for name, value in extra_params.items():
        cr.parameter(name=name, value=value)
    connect.append(cr)
    vr.append(connect)
    return str(vr)
