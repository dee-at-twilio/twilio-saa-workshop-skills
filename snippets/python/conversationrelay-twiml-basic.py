"""Build <Connect><ConversationRelay> TwiML.

Returns the TwiML string you serve from the voice webhook (or hand to
Calls.create as the `twiml` parameter). ElevenLabs voice + Deepgram
nova-3-general STT + `multi` language, with a pre-created
conversation_configuration SID that pins model/prompt/tools.
"""
import os

from twilio.twiml.voice_response import Connect, ConversationRelay, VoiceResponse


ELEVENLABS_VOICE_ID = os.environ["ELEVENLABS_VOICE_ID"]
CONVERSATION_CONFIGURATION_ID = os.environ["TWILIO_CONVERSATION_CONFIGURATION_ID"]


def build_conversationrelay_twiml(ws_url: str, greeting: str) -> str:
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
    connect.append(cr)
    vr.append(connect)
    return str(vr)
