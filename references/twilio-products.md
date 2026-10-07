# Twilio product identity, native behaviors, and native data-shipping

Read before drafting any journey or implementation step that touches TAC, Conversation Orchestrator, ConversationRelay, Conversation Memory, Conversation Intelligence, or any tool call into the customer's system.

**The verify-against-docs rule still applies** — this file is a shape and intent cheat sheet, not a substitute for `mcp__twilio-docs__twilio__retrieve` or the product skills. Cross-check parameter names, event names, and endpoints before copying into a snippet.

## 1. Product identity — the frequently-confused five

### TAC — Twilio Agent Connect (Python/TS helper SDK)

**TAC in the SAA context means Twilio Agent Connect**, the helper SDK packaged as the `tac` module in Python and `twilio-agent-connect` on npm. It is NOT "Agent Copilot", NOT a live-agent desktop, NOT a Twilio product surface in its own right, and NOT Conversation Orchestrator. TAC is how a customer *integrates with* the Twilio conversational products — it is not a replacement for them.

Refer to the customer's side as "your integration app" or "your application" — never "the Orchestrator" (which is the Twilio product).

**Python surface** (cross-check `pages/actions.py` in sierra-test before drafting):

- `TAC(config=TACConfig.from_env())` — SDK instance; single per app. Reads `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `TWILIO_VOICE_PUBLIC_DOMAIN`, CI/Memory config IDs from env.
- `SMSChannel(tac, config=SMSChannelConfig(memory_mode="always"))` — SMS channel; `memory_mode="always"` enables Twilio Memory hydration on every turn.
- `VoiceChannel(tac, config=VoiceChannelConfig(memory_mode="always"))` — Voice channel with the same Memory hydration.
- `InitiateMessagingConversationOptions(to=..., message=...)` — outbound SMS opts.
- `InitiateVoiceConversationOptions(to=..., websocket_url=..., welcome_greeting=..., action_url=...)` — outbound Voice opts.
  - `websocket_url` is the WebSocket endpoint ConversationRelay connects to for the STT/TTS + LLM turn loop.
  - `action_url` is the **post-session callback** on the `<Connect>` verb. Per the [ConversationRelay docs](https://www.twilio.com/docs/voice/twiml/connect/conversationrelay#connect-action-url-callback), Twilio POSTs to `action_url` *after* the `<Connect>` verb ends, with `SessionStatus` (`ended` / `failed` / `completed`), `HandoffData` (if signalled), and standard call fields (`AccountSid`, `CallSid`, `SessionId`, `SessionDuration`). The TwiML with `<Connect><ConversationRelay>` is generated internally by TAC (or handwritten if going direct) at outbound-call answer time, separately from `action_url`.
- Both channels expose `await channel.initiate_outbound_conversation(opts)`; drive from sync code with `asyncio.run(...)`.

**TypeScript surface** (`twilio-agent-connect` on npm — cross-check `github.com/twilio/twilio-agent-connect-typescript` before drafting). Different shape from Python:

- `TAC.create({ config: TACConfig.fromEnv() })` is **async** — await the create call.
- `new VoiceChannel(tac)` / `new SMSChannel(tac)` + explicit `tac.registerChannel(channel)`.
- `new TACServer(tac)` + `await server.start()` must run before `initiateOutboundConversation`, so the inbound reply webhook / WebSocket routes exist when the first customer reply lands.
- Voice `initiateOutboundConversation` takes `{ to, twimlOptions: { welcomeGreeting } }` — the greeting lives under `twimlOptions`, not at the top level. Returns `{ callSid }`.
- SMS `initiateOutboundConversation` takes `{ to, message }` and returns `{ conversationId }`.
- Supports additional channels (`RCSChannel`, `WhatsAppChannel`) off the same TAC instance.

**Pick the SDK that matches the customer's stack**; the two SDKs are not interchangeable in snippet form.

### Conversation Orchestrator — Twilio product, not TAC, not the customer's app

Per [Twilio docs](https://www.twilio.com/docs/conversations/orchestrator): "the foundational data layer that observes traffic from your Twilio account, links it to customer profiles, and makes it available for AI agents and analytics." A Twilio product — not a role, not an SDK, not "the app the customer builds."

If a customer's brief describes an "Orchestrator + Memory + Intel/Intelligence triangle" in their own words, read that as the three Twilio products Conversation Orchestrator + Memory + Intelligence — not license to invent three customer-owned services, and not license to substitute TAC for Conversation Orchestrator.

### ConversationRelay — Voice-only product

ConversationRelay is Twilio's Voice-specific product — STT/TTS + LLM turn loop + tool calls over a WebSocket. It powers a **single channel (Voice)**. It is NOT the abstraction that manages "Web / SMS / Voice / App" as a set. Cross-channel capture is done by Conversation Orchestrator. On the Twilio components diagram, ConversationRelay appears (if at all) as an annotation on the Voice channel.

### Memory and Conversation Intelligence — Twilio products, not customer-owned

- **Memory** — `https://memory.twilio.com/v1`. TAC hydrates against it via `memory_mode="always"`. Do NOT invent a customer-owned `memory.load()` / `memory.recordOutcome()` / vector-store adapter. If profile or history is needed, the answer is Twilio Memory + `memory_mode`.
- **Conversation Intelligence (CI)** — `https://intelligence.twilio.com/v3`. Custom operators: `POST /Operators`, then attached to a CI config (`TWILIO_CINTEL_ID` env var) via `POST /Services/{cintel_id}/Operators`. Operators run over each transcript to produce intents, summaries, sentiment, redactions. Do NOT invent a custom `analyse()` / "Intelligence layer" that duplicates this.
- **Voice / CR Insights** — `https://insights.twilio.com/v1/Voice/{Summaries,Calls/{callSid}/Events}`. CR-specific event names include `prompt_sent`, `first_token_received`, `final_token_received`, `stt_latency`, `tts_latency`, `start_of_customer_speech`, `end_of_customer_speech`, `start_of_agent_speech`, `end_of_agent_speech`, `configurations`.

## 2. Native behaviors that must NOT be re-wrapped

For each tagged product in a journey, confirm the required behavior isn't already native before drafting a new abstraction.

- **ConversationRelay** — STT/TTS turn management, interruption handling, repeat-back, correction flows, and confirmation loops for structured data (DOB, name, phone, digits) are native to the LLM + relay runtime. Deterministic branching (match / no-match / ambiguous / transfer) belongs in an **LLM tool call** into the customer's existing service — the tool returns a structured outcome and the LLM continues. It does NOT belong in a new "controller" the LLM "hands control to". When a customer says "deterministic patient-matching controller", confirm they mean "the LLM must reliably call our decision engine with clean structured inputs and act on its structured response" before drafting anything that looks like middleware. `play` media messages for stable pre-rendered prompts are also native — use them, don't dress them up as a "media strategy runtime".
- **Conference / warm transfer** — participant management, whisper/coach, hold, and supervisor barge are native — don't write a bespoke "handoff runtime".
- **TaskRouter** — worker/queue/workflow routing, reservations, and skills-based routing are native — don't wrap the API in a custom "router class".
- **Conversation Orchestrator / Memory / Intelligence** — capture, storage, recall, and language operators are native — don't invent a "context service" duplicating what the product already emits.

## 3. When Twilio already ships the data — don't invent a customer dependency

Before writing an `import` from a hypothetical `@customer/{thing}` (agent-desktop, notifier, escalator), stop and ask: does Twilio already ship this data through its own primitives?

| Need | Twilio-native mechanism |
|---|---|
| Handoff context to a human agent on warm transfer | `<Dial><Client><Parameter>` or query-string on `To=client:{id}?callSid=...&reason=...`. Twilio delivers each key as a custom parameter on the incoming call in the agent's Voice SDK. Keep payload under ~800 bytes; send references (SIDs, IDs), not full transcripts. |
| Passing data between call legs / to a TwiML action URL | `<Parameter>` inside `<Dial>`, query-string on the action URL |
| Notifying an external system when call state changes | `statusCallback` and `statusCallbackEvent` on `<Dial>` / `<Conference>` / `<Number>` / `<Client>` |
| Structured routing / skills data | TaskRouter task attributes JSON |
| Media metadata to a WebSocket app | ConversationRelay `customParameters` (via `<Parameter>` children on `<ConversationRelay>`); Media Streams stream parameters |
| Post-call state to an external system | Recording / transcription / Conversation Intelligence webhooks |

Identify the native mechanism, then show two things in the impl step: (1) *what* attributes matter (a typed object naming them), and (2) *how* Twilio ships them (the specific native mechanism, cited from docs). Only reach for a customer-owned import when the target genuinely lives outside Twilio's surface (writing to their own DB or auth system) — and even then, name the surface plainly (e.g. `@customer/patient-directory`).

## 4. Snippets must use real Twilio surface

**Do not fabricate Twilio framework surface in snippets.** Code panels must use real Twilio APIs — for ConversationRelay, actual WebSocket message shapes (`setup`, `prompt`, `interrupt`, `text`, `play`, `end`, tool-call messages) and actual TwiML `<ConversationRelay>` verb parameters; for Conference, real `<Dial><Conference>` verbs and Participants REST endpoints. Do NOT invent methods like `controllerRegistry.attach(...)`, `controller.awaitConfirm(...)`, or `existingAgentRuntime.continueWithToolResult(...)`.

If a snippet needs to represent the customer's own system, label it as theirs (a short comment or filename like `customer/decisionEngine.ts`).

## 5. Customer-domain tool bodies aren't part of a Twilio workshop

Tool names that clearly belong to the customer's business — `verifyIdentity`, `quoteBalance`, `promiseToPay`, `sendPaymentLink`, `markDNC`, `escalate`, `checkEligibility` — are customer-owned:

- Do NOT invent bodies for these tools; Twilio only references them by name via the LLM's tool-calling surface.
- If a tool is only referenced (e.g. "on `escalateToHuman`, warm-transfer via Flex"), show only the Twilio-side handoff wiring, not the tool body.
- If a tool IS Twilio-side (e.g. `send_link_over_sms` using the Messages API), include a real Twilio snippet.
- If unsure whether a tool is Twilio-side or customer-side, **ask before drafting**.
- Do not create a dedicated "Agent tools" tab whose body is a fabricated grab-bag of customer domain functions. Either drop the tab (renumber) or narrow it to a single Twilio-native tool with a real snippet.
