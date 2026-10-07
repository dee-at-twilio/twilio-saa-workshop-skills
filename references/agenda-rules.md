# Agenda — per-day slide rules

Read when drafting the "Agenda · Day N" slides (one per day).

## Block types and colors

- `talk` — dusty blue. Standups, intros, scope review.
- `build` — terracotta. Hands-on build time, mapped 1:1 to journeys.
- `planning` — ochre. Architecture review, scoping (rare).
- `retro` — violet. End-of-day debrief.
- `break` — neutral. Meals, breaks. No format tag, no invented description.

## Required structure

- Welcome/intros at the start of Day 1.
- Recap block **only if there's genuinely prior work**.
- Architecture review / scope-setting before building starts.
- **Build blocks mapped 1:1 to the journeys**, tagged `build`. Every regular
  (non-bonus) journey must have real build blocks — not a "scoping" or
  "walkthrough" planning slot. Timeline titles name what's being built
  ("Journey N — {step name}"). Bonus journeys consume leftover build time.
- `retro` at the end of each day; `talk` standup at the start of Day 2+.
- Meals as their own `break`-class rows.
- A closing "what's next"/"ideation" block on the final day, kept generic —
  never invent a specific hypothetical technical debate.

## Timing rules

- **No mid-morning break.** Go straight through from the day's opening block
  into the first build block until lunch.
- **Lunch after ~3.5 hours** from the day's start (e.g. 09:00 → 12:30). Apply
  every day, including Day 2+ which opens with a standup.
- **No single session runs longer than 1.5 hours** by default. If a stretch of
  work would run longer, split into consecutive smaller sessions (even with no
  break between), each with its own row and descriptive title.

## Build-block coverage check

Before drafting, list every regular journey and confirm each has at least one
build block. If duration can't fit them all, **flag it to the user and ask what
to drop or defer** — do not silently demote a journey to a planning slot.

## In-person vs. virtual vs. hybrid

- **In-person:** arrival buffer before the formal start; Location field in the
  header meta; optional evening social block if confirmed, with a `t-note`
  only if the venue is TBD.
- **Virtual:** no location, no arrival buffer, no dinner block; keep breaks
  shorter and more frequent. Don't invent a "join link" placeholder.
- **Hybrid:** ask for location (for the in-person side); note which sessions
  are in-person-only.
