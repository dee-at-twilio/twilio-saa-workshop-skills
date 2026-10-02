// ConversationRelay — deliver stable pre-rendered prompts via `play`.
// For fixed intake / questionnaire prompts, pre-render once and deliver
// via ConversationRelay's `play` message so callers hear identical
// audio every call. Use `text` (see relay-send-agent-response.ts) for
// connective / dynamic speech.

import type { WebSocket } from 'ws';

const PROMPT_MEDIA = {
  askDOB:   'https://cdn.example.com/prompts/ask-dob.wav',
  askName:  'https://cdn.example.com/prompts/ask-name.wav',
  askPhone: 'https://cdn.example.com/prompts/ask-phone.wav',
};

export function playPrompt(socket: WebSocket, key: keyof typeof PROMPT_MEDIA) {
  socket.send(JSON.stringify({
    type: 'play',
    source: PROMPT_MEDIA[key],
    loop: 1,
    preemptible: true,
    interruptible: true,
  }));
}
