# Implementation slides — step/panel rules

Read before drafting any Implementation slide pair (Overview + Steps). Pairs
appear after Outcomes, in the same order as the journey slides. Bonus journeys
last.

## Slide pair structure

**Overview slide** (`data-menu="Journey {N} · Overview"`,
`data-menu-group="Implementation"`): eyebrow, `h2` `"Journey N: {title}"`,
`.tag-row.impl-tags`, and a numbered `<ol class="impl-recap">` — one `<li>` per
step. Each `<li>` leads with the step's number + short name in `<strong>`
(matching the tab button label on the next slide exactly), an em dash, and a
one-line description reusing the `.step-desc` wording. No tabs, no code — a
"what are we about to walk through" preview.

**Steps slide** (`data-menu="Journey {N} · Steps"`): same eyebrow/h2/tag-row
and the `.impl-tabs` strip + tab panels. Every implementation step renders as
a tab, one tab per step, regardless of count (even a single-step journey uses
one tab).

Bonus journeys use `data-menu="Bonus · Overview"` / `"Bonus · Steps"`.

**Steps slide structure:**
- `.impl-tabs` — one `.impl-tab-btn` per step, labeled `"{step number} {short step name}"` (must match the recap `<li>` `<strong>` labels)
- One `.impl-tab-panel` per tab, each containing:
  - a `.step-title` and `.step-desc` (what was done and why)
  - zero or more `.code-panel` blocks
  - zero or more `.screenshot-panel` blocks

## What counts as an implementation step

A piece of Twilio-side wiring the workshop actually produces, shown by a code
snippet in the tab. Every impl step must contain a `.code-panel` — that
snippet is the point. Two named exceptions:

1. **Customer-owned code steps** — body lives in the customer's system; the
   `.step-desc` alone is the tab.
2. **Console screenshot steps** — the required Twilio Console screenshot tab
   following any phone-number provisioning / voice-URL step; the
   `.screenshot-panel` is the tab (see "Phone number provisioning" below).

**Do NOT create impl steps for testing, verification, or edge-case lists.** A
`.step-desc` reading "run each of these scenarios" or a code panel that's
actually a bulleted test-case checklist is a QA plan, and the deck is not the
place for it.

**But do NOT drop the concern either.** Every edge case a journey names — long
pauses, filler phrases while the agent is thinking, barge-in/interrupt
handling, DTMF fallback, low-confidence STT retries, silence re-prompts — is a
real Twilio-side implementation concern with real code. Turn each concern into
its own single-responsibility impl step with an actual code snippet.

**If you can't figure out the right implementation shape**, ask a targeted
question (e.g. "For silence handling — do you want a hard timeout after N
seconds, or streaming filler tokens while the LLM runs?") rather than deleting
the concern. Consulting the Twilio product skill is the first move; asking is
the second; dropping is not an option.

**Impl-step splits are cheap.** A broad concern that would need three distinct
snippets becomes three impl steps and three tabs, each with its own
single-responsibility snippet.

Workshop time spent exercising scenarios end-to-end against the live number is
still a legitimate `build` block on the day agenda — the constraint here is
what goes inside the Steps tabs.

## Code panels

- Plain IBM Plex Mono, no syntax color-coding — comments/keywords/strings all
  render the same color.
- Each panel has a `.code-label` filename-style label (e.g.
  `orchestrator-trigger.ts`) matching the workshop's tech stack.
- Before writing a new snippet, **read `snippets/{language}/README.md`** — it
  indexes every reusable snippet by product and action. If a match exists,
  copy that file into the code panel verbatim.
- **All checked-in snippets are trusted.** Do not rewrite one "to be safe" —
  if it's in the folder, it's known-good. Customer-specific tweaks (renamed
  tool names, different voice/model) are inline edits in the generated deck
  only; do NOT edit the snippet file to carry them.
- **If a snippet is actually wrong**, fix it in place in
  `snippets/{language}/{file}` so the next workshop starts from the
  correction. Do not fork `foo-v2.{ext}`.
- After generating a build log with new snippets, **ask the user whether to
  save** the new/reusable ones to `snippets/{language}/` as
  `{product}-{action}.{ext}` and add a one-line entry to `README.md`.
- Snippets reflect what the user actually told you was built, or are clearly
  representative patterns — never fabricate call-outs, endpoints, or config
  values presented as the customer's real ones.
- **Snippets are self-contained — every non-standard identifier must be
  introduced at the top.** A reader must never have to guess whether a symbol
  is customer code, Twilio SDK, Node builtin, or a helper from another slide.
  Add:
  - `import { X } from '@customer/...'` for customer-owned surface.
  - `import { X } from './siblingFile'` for helpers defined in another snippet
    of the same workshop (reference the exact filename in that snippet's
    `.code-label`).
  - `import { X } from 'twilio' / 'ws'` etc. for real library imports.
  - `type X = ...` or `interface X { ... }` for types the snippet uses but
    doesn't define.
- **One responsibility per step; snippets contain only the code implementing
  that step.** If related code genuinely needs to be shown, give it its own
  step and its own tab.
- **No code snippets for steps whose implementation lives in customer-owned
  code.** The step's `.step-desc` (name of the tool, its input tuple, return
  shape) is the whole content.
- **Function/tool naming:** if the user gives real names, use them. Otherwise,
  generate structured, well-meaning names from the use case (`matchPatient`,
  `searchAvailability`, `scheduleAppointment`) — don't ask, don't leave
  `doThing()`. No in-slide disclaimer that names are "representative."

## Screenshot panels

- Structure mirrors the code panel: bordered `.screenshot-panel` with a
  caption bar.
- **Always embed images as base64 data URIs** in `<img src="data:...">`.
  Never reference an external file path — the deck stays a single
  self-contained file (only the Google Fonts `<link>` is external).
- Placement is driven by user instruction — "add this screenshot to step 2 in
  journey 2" maps to that journey's slide, tab 2.
- Always include a caption. If the user doesn't give one, ask.
- Screenshots usually carry visible SIDs, phone numbers, customer names —
  flag this once before embedding, but don't attempt automatic redaction.
- Only customer-agnostic, reusable screenshots (e.g. "where to find X in
  Console") belong in `assets/console/`. Customer-specific screenshots stay
  embedded in that one workshop's file.

## Phone number provisioning → always follow with a Console screenshot step

Whenever an implementation step provisions (or configures the Voice URL /
webhook on) a Twilio phone number for **ConversationRelay** or **TAC**,
immediately insert a following tab titled `"NN Twilio Console"` whose sole
purpose is a `.screenshot-panel` of the number's Console configuration page.
The user supplies the actual screenshot — leave a placeholder `<img>` (inline
SVG data URI with caption "placeholder — real console screenshot goes here")
and flag which slide/tab the placeholder is on.

Fixed pairing, not conditional. Don't skip it because the step "already has
code" — the screenshot is what makes the wiring reviewable after the fact.
Renumber later tabs accordingly.
