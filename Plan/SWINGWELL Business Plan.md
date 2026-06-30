# SWINGWELL Business Plan

## Working idea

SWINGWELL started as a personal golf-improvement system: capture practice sessions, rounds, screenshots, and reflections; turn them into canonical diary entries; update a dashboard; and use the evidence to decide what to practice next.

The possible business is not simply “a golf dashboard.” The possible business is:

> Turn messy golf evidence into a clear improvement system.

Many golfers already collect fragments of useful data in apps, screenshots, scorecards, simulator reports, Apple Notes, lesson notes, and memory. The hard part is making that evidence coherent enough to answer:

- What is actually improving?
- What is leaking under pressure?
- Is practice transferring to rounds?
- What should I practice next?

SWINGWELL could help golfers stop guessing.

## Core promise

SWINGWELL helps an improving golfer convert rounds and practice evidence into:

- a durable diary
- a personal performance dashboard
- trend analysis
- practice recommendations
- monthly progress reviews

The emotional promise:

> “You are not just practicing. You are building evidence.”

## Origin story / proof spine

The strongest initial proof will be the founder’s own improvement.

Current personal goal:

- Starting index around 19.9
- Current index: 19.2
- Target: drop roughly 6 strokes, toward a 13 index

If the system helps produce that drop, the public story becomes:

> “I used SWINGWELL to organize my practice, identify the real constraint, and track whether it transferred to rounds. Here is the evidence trail.”

That story matters because it is grounded, not hype.

## Target customer

Best early customer:

- adult recreational golfer
- motivated to improve
- plays and/or practices regularly
- already uses at least one golf app, launch monitor, scorecard, or simulator
- has some data but does not know what to do with it
- likely index range: 10–30
- willing to spend modestly on golf improvement

Less ideal early customer:

- golfer who rarely practices
- golfer who wants magic swing advice from one screenshot
- golfer who already has a full-time coach and a mature stats workflow
- golfer who wants pure social/community features

## Problem

Golfers often practice with good intentions but weak feedback loops.

Common pattern:

1. Play a round.
2. Feel vaguely good or bad.
3. Save a screenshot or scorecard.
4. Practice what feels urgent.
5. Forget the prior pattern.
6. Repeat.

The result is fragmented improvement. The golfer may work hard but not know whether the work is transferring.

## Product concept

User submits:

- round screenshots
- scorecards
- practice screenshots
- simulator data
- short notes
- lesson takeaways

SWINGWELL produces:

- canonical diary entries
- dashboard updates
- front/back round comparisons
- fairway / GIR / putting trends
- practice-to-round ratio
- current constraint analysis
- recommended next practice block
- monthly progress summary

## MVP service model

Start as a service before building a full software product.

This keeps the offer human, small, and learnable.

### MVP workflow

1. Customer sends recent golf evidence.
2. SWINGWELL builds a personal dashboard.
3. SWINGWELL writes a short analysis.
4. SWINGWELL recommends the next practice priorities.
5. Customer sends new rounds/practices over time.
6. Dashboard and recommendations update monthly or after key sessions.

### Inputs

- last 3–5 rounds
- 2–5 practice sessions
- handicap index if available
- stated goal
- any notes about lessons, injuries, constraints, or schedule

### Outputs

- personal dashboard
- canonical diary archive
- “what matters now” summary
- one-page practice plan
- monthly progress report

## Possible pricing

Early cottage-business pricing:

- $29 one-time setup for dashboard and initial analysis
- $10/month for dashboard updates and recommendations

Alternative higher-touch pricing:

- $49/month for monthly review + practice plan
- $99 one-time “build my golf improvement dashboard” package

Initial instinct:

Start with a simple setup fee plus low monthly subscription. If the work is more manual than expected, raise the price or limit volume.

## Positioning

Avoid overclaiming “AI golf coach.”

Better language:

- “Golf improvement dashboard”
- “Practice-to-round transfer tracker”
- “Personal golf evidence system”
- “Stop guessing what to practice”
- “Turn your rounds and practice notes into a plan”

Possible tagline:

> Stop guessing what to practice.

Another:

> Your golf evidence, organized into improvement.

## Differentiation

Existing golf apps often track stats. SWINGWELL connects stats to practice behavior and narrative evidence.

Differentiators:

- accepts messy inputs
- combines practice and round data
- preserves context, not just numbers
- identifies constraints
- produces practical next-session recommendations
- tracks whether practice transfers to the course

The key is synthesis, not data collection.

## Early product features

### Must-have

- upload or send screenshots / notes
- canonical diary entry generation
- dashboard generation
- round/practice trend tracking
- front/back split table
- practice recommendations
- hosted dashboard

### Nice-to-have

- monthly PDF report
- coach export
- goal tracking
- automated screenshot extraction
- custom domain per customer
- email or text reminders
- benchmark comparison by handicap range

### Not needed at first

- mobile app
- social network
- swing video analysis
- payment automation
- fully self-serve onboarding
- live integration with every golf app

## Operational workflow

Current internal skills:

- `swingwell-note-to-canonical`
- `swingwell-update-dashboard`
- `swingwell-publish-dashboard-s3`

Current working pipeline:

1. Capture source material.
2. Convert to canonical diary Markdown.
3. Update dashboard JSON / HTML.
4. Publish static dashboard to S3.
5. Use dashboard evidence to recommend practice.

This can remain semi-manual while testing demand.

## Risks

### Data extraction friction

Golf apps and screenshots vary. Automatic extraction may be unreliable.

Mitigation:

- start with human-assisted extraction
- support a small number of common formats first
- ask users for minimal structured notes when needed

### Sparse data

Some golfers will not have enough rounds or practice sessions to support strong recommendations.

Mitigation:

- be explicit about confidence level
- recommend data collection habits
- focus on simple next steps

### Overpromising improvement

Golf improvement is noisy and affected by lessons, fitness, time, weather, course difficulty, and life.

Mitigation:

- promise clarity, not guaranteed strokes
- phrase recommendations as evidence-based hypotheses
- track outcomes honestly

### Manual workload

At $10/month, too much hand work could become unprofitable.

Mitigation:

- cap early customers
- template the workflow
- automate only repeated bottlenecks
- consider a higher-touch tier

## Ethical posture

This should help golfers feel more capable, not more judged.

Tone:

- evidence-based
- encouraging
- practical
- humble

Avoid:

- shame
- fake certainty
- pretending every bad round has a simple cause
- replacing a qualified coach when technique work is needed

## First experiments

### Experiment 1: Founder proof

Use SWINGWELL personally until the target index drop is either achieved or meaningfully tested.

Success signal:

- clear evidence that the system changed practice decisions
- visible trend improvement
- honest story about what worked and what did not

### Experiment 2: Friendly pilot

Offer to build dashboards for 3–5 golfers.

Ask:

- Would you send me your last few rounds and practice notes?
- Would this dashboard change what you practice?
- Would you pay $10/month for updates?
- What part felt most useful?

Success signal:

- at least 2 people say they would pay
- at least 1 person actually pays
- recommendations feel useful even with imperfect data

### Experiment 3: Setup package

Sell a one-time dashboard setup.

Possible offer:

> Send me your last five rounds and recent practice notes. I’ll build your personal improvement dashboard and give you a 30-day practice plan.

Success signal:

- someone pays for setup
- setup can be completed in less than 2 hours
- output feels reusable and not overly bespoke

## Open questions

- Is $10/month enough to support the manual work?
- Would golfers prefer one-time reports over subscription?
- How much data is enough to make useful recommendations?
- Which input format is most common: Golfshot, Arccos, GHIN, scorecard photos, simulator screenshots?
- Should SWINGWELL be consumer-facing or coach-supporting?
- Would coaches pay for a “student evidence dashboard”?

## Near-term next steps

1. Keep using SWINGWELL personally.
2. Preserve all canonical data carefully.
3. Track the index-drop story honestly.
4. Add a dedicated `round-splits.json` data file.
5. Make the hosted dashboard easy to update.
6. Draft a one-page landing page.
7. Identify 3 friendly pilot users.
8. Test whether anyone would pay for a setup package.

## Current stance

This should remain a cottage business unless reality argues otherwise.

The first goal is not scale. The first goal is usefulness.

If the system helps one golfer practice with more clarity and less self-judgment, that is already a good start.
