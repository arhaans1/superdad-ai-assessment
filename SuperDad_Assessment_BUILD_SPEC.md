# SuperDad AI Assessment — Build Specification

**For:** Platform of Papas (POPS) — Vishal Kumar Singh
**Built by:** ASR Media Pro
**Purpose:** A web-based AI assessment delivered mid-webinar. Fathers answer ~17 questions, get a personalised AI-generated report with an archetype, a 5-dimension score, a written diagnosis, and one focus shift. Captures leads for Vishal.

> **Why a work dimension:** The core POPS thesis is that work and family reinforce each other — they are not a trade-off. So the assessment measures how a father shows up at WORK too (initiative, team play, leadership presence) and mirrors it against how he shows up at HOME. This mirror — e.g. "you take initiative at work but wait at home" — is one of the most powerful insights the report can deliver, and it ties straight back to the webinar's promise.

> **How to use this file:** Paste this into Claude Code as the master spec. Build it in stages (see "Build Order" at the end). Do not skip the data model or the admin panel — both are required.

---

## 1. PRODUCT OVERVIEW

### What the user (a father) experiences
1. Lands on a branded intro page → clicks "Start My Assessment"
2. **Lead capture FIRST** — name, email, phone, city (required before questions). This is the trade for the free assessment.
3. Answers ~17 questions (15 multiple-choice + 2 short open-text)
4. A short "AI is analysing your answers…" animation (~4–6 seconds, real API call happening)
5. **Results page** — shows EVERYTHING:
   - Their **Archetype** (1 of 6) with a title + description
   - **5-dimension score** (radar/spider chart + individual bars, 0–100 each)
   - A **personalised AI-written diagnosis** (3–4 paragraphs, references their open-text answers)
   - **One focus shift** — the single most important thing to work on
   - **One soft bridge** to the offer at the very end (see §7)
6. Option to download/screenshot their report.

### What Vishal + Arhaan experience (admin)
- A login-protected admin panel
- Table of all submissions: name, email, phone, city, archetype, 5 scores, timestamp
- Click any row → see the full report + their raw answers (including open-text)
- Export all leads to CSV
- Basic stats: total submissions, archetype distribution, average scores

---

## 2. TECH STACK (recommended)

Keep it simple, deployable, and cheap to run.

- **Framework:** Next.js (App Router) — frontend + API routes in one app
- **Database:** SQLite via Prisma for local/simple, OR Postgres (Supabase/Neon free tier) for production. Use Prisma ORM either way so switching is trivial.
- **AI:** Anthropic Claude API (`claude-sonnet-4-6` or latest available). Used to generate the personalised diagnosis from the user's answers.
- **Styling:** Tailwind CSS. Brand tokens in §8.
- **Charts:** `recharts` (radar chart + bar chart)
- **Auth (admin only):** Simple — a single shared admin password stored in an env var, checked server-side, sets an httpOnly session cookie. No need for full auth system for v1.
- **Hosting:** Vercel (frontend + API). Database on Supabase/Neon if Postgres.

### Environment variables needed
```
ANTHROPIC_API_KEY=...
ADMIN_PASSWORD=...           # for the admin panel login
DATABASE_URL=...             # prisma connection string
SESSION_SECRET=...           # for signing the admin cookie
```

---

## 3. DATA MODEL (Prisma schema)

```prisma
model Submission {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())

  // Lead capture
  name          String
  email         String
  phone         String
  city          String

  // Raw answers (store everything so we can re-score / audit later)
  answers       Json     // array of { questionId, value } — includes MCQ + open text

  // Computed scores (0-100 each)
  scoreConsistency   Int
  scoreOwnership     Int
  scoreRelationships Int
  scoreInitiative    Int
  scoreWork          Int   // Work Integration — how he shows up at work
  scoreOverall       Int   // average of the five

  // Result
  archetypeKey  String   // e.g. "ghost"
  archetypeName String   // e.g. "The Ghost"
  diagnosis     String   @db.Text  // the AI-generated report text
  focusShift    String   @db.Text  // the single focus recommendation

  // Meta
  aiModel       String?  // which model generated it
  userAgent     String?
}
```

---

## 4. THE QUESTION SET (FINAL — use exactly this)

17 questions total. Each MCQ option carries points (0–4) toward ONE dimension. Two questions are open-text (analysed by AI, not scored numerically but used in the diagnosis).

> **Scoring note:** Each of the 5 dimensions has 3 scoring questions. Max raw per dimension = 12 (3 questions × 4 points). Normalise to 0–100: `score = round(raw / 12 * 100)`.

> **Question order in the UI:** Mix the dimensions so it doesn't feel repetitive — don't show all 3 Consistency questions back to back. Suggested display order interleaves home and work questions, ending with the 2 open-text. Keep the internal dimension mapping as below regardless of display order.

### Intro / framing (shown above Q1, not a question)
> "Answer honestly — there are no right answers. This is just for you. In 3 minutes, you'll see exactly where you stand as a father today."

---

### DIMENSION: CONSISTENCY (Q1–Q3)

**Q1.** On a typical weekday, how much fully-present time (no phone, no distractions) do you spend with your child?
- (0) Honestly, almost none
- (1) A few minutes here and there
- (2) About 15–20 minutes
- (3) 30–45 focused minutes
- (4) An hour or more, consistently

**Q2.** How predictable are you as a presence at home — can your family count on you showing up the same way each day?
- (0) Not at all — it depends entirely on my work and mood
- (1) Rarely — most days are unpredictable
- (2) Somewhat — good weeks and bad weeks
- (3) Mostly — I'm fairly steady
- (4) Completely — they know exactly what to expect from me

**Q3.** When work gets intense, what usually happens to your time at home?
- (0) Home time disappears completely
- (1) It shrinks badly and stays shrunk
- (2) It takes a hit but I recover after a while
- (3) I protect it most of the time
- (4) I hold my home boundaries no matter what

---

### DIMENSION: OWNERSHIP (Q4–Q6)

**Q4.** Who do you see as primarily responsible for the emotional connection in your home?
- (0) My wife — that's really her domain
- (1) Mostly my wife, I help sometimes
- (2) We split it, but she carries more
- (3) We share it fairly equally
- (4) I take full ownership of my part, actively

**Q5.** When something feels "off" between you and your child, what's your instinct?
- (0) Wait for it to pass on its own
- (1) Hope my wife handles it
- (2) Worry about it but not act
- (3) Bring it up when I find the right moment
- (4) Take initiative to understand and address it directly

**Q6.** How much do you believe the state of your family life is within your control to change?
- (0) Not much — it's just how things are now
- (1) A little, but the damage feels done
- (2) Maybe, if circumstances change first
- (3) Largely — if I do the work
- (4) Completely — change in me creates change around me

---

### DIMENSION: RELATIONSHIPS (Q7–Q9)

**Q7.** How well do you actually know what's going on in your child's inner world right now — their fears, friends, dreams?
- (0) I realise I don't really know
- (1) Only the surface
- (2) Some of it
- (3) A good amount
- (4) Deeply — we talk about real things

**Q8.** When was the last time your child came to YOU first with something important?
- (0) I can't remember it happening
- (1) It's been a very long time
- (2) Occasionally, for practical things
- (3) Fairly recently
- (4) Regularly — I'm often their first call

**Q9.** How would you describe the emotional climate between you and your partner lately?
- (0) Distant — we're more like roommates
- (1) Strained or tense
- (2) Functional but flat
- (3) Warm most of the time
- (4) Genuinely connected and growing

---

### DIMENSION: DAILY INITIATIVE (Q10–Q12)

**Q10.** Have you ever invested in learning how to be a better father (book, course, coach, programme)?
- (0) Never — it never occurred to me
- (1) I've thought about it but never did
- (2) I've read/watched a little
- (3) Yes, a few things
- (4) Yes — I actively keep learning and applying

**Q11.** Do you have any daily or weekly ritual that you do WITH your family, on purpose?
- (0) No, nothing intentional
- (1) Not really, it's all ad hoc
- (2) One loose thing, inconsistently
- (3) Yes, one or two we mostly keep
- (4) Yes — intentional rituals we protect

**Q12.** When you think about working on yourself (your stress, your patterns, your growth), where are you?
- (0) I don't have the time or energy for that
- (1) I know I should but haven't started
- (2) I dabble occasionally
- (3) I work on it semi-regularly
- (4) It's a consistent priority — I know it makes me a better father

---

### DIMENSION: WORK INTEGRATION (Q13–Q15)

> This dimension measures how he shows up at WORK. The AI later mirrors it against his home scores — the gap (or alignment) between the two is the insight.

**Q13.** At work, when something needs to be done, how do you typically operate?
- (0) I wait to be told what to do
- (1) I do my part, but rarely more
- (2) I step up when it's clearly expected
- (3) I often take initiative before being asked
- (4) I consistently lead — I see what's needed and drive it

**Q14.** How would your colleagues describe you as a team player?
- (0) I mostly keep to myself / work alone
- (1) I do my bit but don't really collaborate
- (2) I'm cooperative when needed
- (3) I'm a strong, dependable teammate
- (4) I actively lift the whole team — people are better with me around

**Q15.** Think about the energy, focus and intentionality you bring to your career. Now compare it to what you bring to your family life. How do they match up?
- (0) Work gets nearly all of my best energy; family gets the leftovers
- (1) Work clearly gets more of my best self
- (2) Work gets a bit more, but I'm trying to balance it
- (3) They're fairly evenly matched
- (4) I bring my best, most intentional self to my family — even more than to work

---

### OPEN-TEXT (Q16–Q17) — analysed by AI, not numerically scored

**Q16.** Describe one recent moment with your child or family that stayed with you — good or hard. What happened, and how did it make you feel?
- *(free text, ~2–4 sentences. Placeholder: "There are no wrong answers — just write what comes to mind.")*

**Q17.** If one thing could change about your life as a father in the next 90 days, what would it be?
- *(free text, ~1–2 sentences.)*

> The AI uses Q16 + Q17 heavily to personalise the diagnosis so it feels written *for them*. This is the "blow their mind" lever — make sure the prompt (see §6) instructs the model to reference these specifically. The AI should ALSO comment on the work-vs-home mirror (Work Integration score vs the home dimensions) when there's a meaningful gap.

---

## 5. ARCHETYPE DETERMINATION LOGIC

Compute the five dimension scores first (0–100 each). Then assign archetype by pattern. Implement as a deterministic function; the AI does NOT pick the archetype (keeps it consistent + fast). The AI only writes the prose.

> **Note on Work:** The archetype is driven mainly by the four HOME dimensions. Work Integration (W) is used as a *modifier* — specifically, a high work score combined with low home scores is the classic signature of "The Ghost" and "The Provider." The work–home GAP is the story the AI tells, but the archetype itself stays anchored to how he shows up at home.

```
function determineArchetype(scores):
    C = consistency, O = ownership, R = relationships, I = initiative, W = work
    homeOverall = avg(C,O,R,I)        // archetype is anchored on home
    workHomeGap = W - homeOverall      // positive = much stronger at work than home

    // The aspirational top end — strong at home AND reasonably integrated
    if homeOverall >= 78 and min(C,O,R,I) >= 65:
        return "present"          // The Present Father

    // Already self-aware and moving, but not yet consistent
    if I >= 55 and homeOverall between 45 and 77 and O >= 50:
        return "awakening"        // The Awakening Father

    // Provides/owns materially but emotional connection lags
    // (often a big positive work-home gap — crushing it at work, distant at home)
    if O >= 55 and R <= 45:
        return "provider"         // The Provider

    // Connection only shows up in bursts / weekends — relationships mid but consistency low
    if C <= 40 and R >= 45:
        return "weekend"          // The Weekend Dad

    // Only engages reactively — initiative low, ownership low-mid, relationships low
    if I <= 40 and O <= 50 and R <= 50:
        return "firefighter"      // The Firefighter

    // Physically there, mentally absent — low consistency + low relationships, default catch
    // (classic signature: high W, low home — all his best energy goes to work)
    return "ghost"                // The Ghost
```

> **Tuning note:** Order matters (first match wins). Test with edge profiles. The catch-all is "The Ghost" because it's the most common modern-father pattern and ties cleanly to Secret #2. A large positive `workHomeGap` (e.g. W ≥ 70 while homeOverall ≤ 45) is the textbook Ghost/Provider — make sure the AI diagnosis calls this mirror out explicitly.

### The 6 Archetypes (display copy)

**The Provider** (`provider`)
> You carry your family on your shoulders. You give everything you have — financially, materially, dependably. But somewhere along the way, providing became a substitute for connecting. Your family has your effort. What they're quietly missing is *you*. The good news: the same drive that makes you a great provider can make you a deeply present father — once you learn where to point it.

**The Ghost** (`ghost`)
> You're home. You're at the table. You're in the room. But your mind is still in the meeting, still solving the problem, still somewhere else. Your family feels the difference between your body being present and *you* being present — and so do you. This isn't a character flaw. It's a skill no one taught you: how to actually arrive when you get home.

**The Firefighter** (`firefighter`)
> You show up when there's a problem to solve — a crisis, a conflict, a thing to fix. You're reliable in the emergency. But connection isn't built in emergencies; it's built in ordinary moments. Right now you're reacting to your family instead of building with them. The shift ahead is from putting out fires to lighting them.

**The Weekend Dad** (`weekend`)
> Monday to Friday, you're running. The weekend is when you try to make up for it — and you carry a quiet guilt the rest of the week. But connection isn't a debt you repay on Saturday. It's a thread woven through ordinary days. You don't need more time. You need a different way of being present in the time you already have.

**The Awakening Father** (`awakening`)
> Something has already shifted in you. You can feel the gap between the father you are and the father you want to be — and that awareness is the hardest part, and you're already past it. You're taking steps, even if they're inconsistent. What you need now isn't motivation. It's a system, and a community of men walking the same path, so the change finally *sticks*.

**The Present Father** (`present`)
> You've done real work, and it shows. You're consistent, you take ownership, and your family feels you — not just your presence, but *you*. You're in rare company. The path ahead isn't fixing what's broken; it's deepening what's already strong, and perhaps helping other fathers find what you've found. Mastery, not repair.

---

## 6. THE AI DIAGNOSIS — PROMPT SPEC

After scoring + archetype are computed server-side, call the Anthropic API to generate `diagnosis` and `focusShift`. Send the model: the five scores (incl. Work), the archetype, and the two open-text answers.

### System prompt (use as-is, tune tone if needed)
```
You are an insightful, warm, and emotionally intelligent coach for fathers,
writing on behalf of Platform of Papas (founder: Vishal Kumar Singh). You are
writing a short personalised assessment report for a father who just completed
a self-assessment.

Your voice: warm, direct, never preachy, never clinical. You speak to him like
a coach who genuinely sees him. Simple language a 5th grader could follow. Short,
punchy sentences. No jargon. India-aware (use relatable Indian family context
where natural, but do not overdo it).

Rules:
- Do NOT shame or judge. Every father here is trying. Acknowledge effort.
- Be specific. Reference his actual written answers so it feels written for him.
- Do not give medical or psychological diagnoses.
- Keep hope front and centre: change is possible, it's not too late.
- Do not hard-sell. One gentle forward-looking line at the very end is allowed,
  pointing toward "the path ahead" — but no pricing, no pushy CTA.
```

### User prompt template
```
Here is a father's assessment data. Write his personalised report.

ARCHETYPE: {archetypeName}
HOME SCORES (0-100): Consistency {C}, Ownership {O}, Relationships {R}, Daily Initiative {I}.
WORK SCORE (0-100): Work Integration {W}.
Overall (home) {homeOverall}. Work-vs-home gap: {workHomeGap}.

His own words:
- A recent moment that stayed with him: "{Q16 answer}"
- What he'd change in the next 90 days: "{Q17 answer}"

Write TWO things, separated by the marker [FOCUS]:

1. DIAGNOSIS (3–4 short paragraphs):
   - Open by reflecting back his archetype in a way that feels seen, not labelled.
   - Weave in his strongest dimension (genuine credit) and his weakest (gently).
   - IF there is a meaningful gap between his Work score and his home scores,
     name it directly and compassionately — e.g. "You bring initiative and
     leadership to work, but at home you wait." This work–home mirror is a key
     insight; use it when the numbers support it.
   - Reference his written answers directly — show him you read them.
   - End this section on a hopeful, possibility-focused note.

2. [FOCUS] FOCUS SHIFT (2–3 sentences):
   - The single most important shift for him to focus on first, based on his
     lowest dimension and his stated 90-day desire.
   - Make it feel doable and specific, not generic.

Output only the report. No preamble.
```

### Parsing
Split the model output on `[FOCUS]`. Everything before = `diagnosis`. Everything after = `focusShift`. Store both. Fallback: if the marker is missing, put whole output in `diagnosis` and generate a generic `focusShift` from the lowest dimension.

### Cost / latency
- One API call per submission. Cheap. Keep `max_tokens` ~800.
- Show the "AI is analysing…" animation while this runs.
- If the API fails, fall back to a pre-written diagnosis per archetype (store 6 fallback templates) so the user NEVER sees an error. This matters during a live webinar.

---

## 7. THE SOFT BRIDGE (end of results page)

After the diagnosis + focus shift, one calm, value-first block. NOT a hard pitch.

> **Suggested copy:**
> "This assessment is a snapshot — a starting point. The fathers who actually close the gap don't do it alone. They do it with a clear system and a room full of men walking the same path. If something here resonated, the rest of today's session is built exactly for that. Stay with us."

(No price, no button to checkout. Just a nudge to stay in the webinar. Vishal can verbally tie it to the offer live.)

Optionally: a single button "Download My Report" (renders the report as a PDF or triggers print-to-PDF).

---

## 8. BRAND / DESIGN TOKENS — STRICT (from the official FFFC Brand Book)

> **This is non-negotiable. The app must follow these exactly.** Source: Family-First Father's Club Brand Book (Semeion Consulting). Do not introduce any colours, fonts, or styles outside this system.

### Brand identity
- **Brand name:** Family-First Father's Club / Platform of Papas (POPS)
- **Tagline:** "Connected Fathers. Confident at work."
- **Descriptor:** "An exclusive community for men who want to show up fully at home, without falling behind at work."

### Colour palette (use these hex values exactly — name → hex → role)
```
SLATE BLUE    #2F4F5C   Primary       → headers, dark backgrounds, primary brand colour
BURNT ORANGE  #D96C2F   Action        → primary buttons, CTAs, key actions
DEEP AMBER    #E5531D   Urgent Action → urgent accents, highlights that need attention
MUTED GOLD    #C58A2B   Accent        → score highlights, accents, the Work axis tint
DARK GRAY     #505050   Text          → body text
WHITE         #FFFFFF   Background    → main background / light surfaces
```
The six above are the OFFICIAL palette. You may use a slightly darker slate (#243D47)
ONLY as a subtle panel shade if needed — nothing else outside the six.

Suggested usage:
- Page background: White (#FFFFFF). Dark sections/header bands: Slate Blue (#2F4F5C).
- Primary buttons ("Start My Assessment", "See My Results"): Burnt Orange (#D96C2F).
- Urgent/emphasis only, sparingly: Deep Amber (#E5531D).
- Score bars / radar fill / accents: Muted Gold (#C58A2B).
- Body copy: Dark Gray (#505050) on white; White on slate.

### Typography (exactly as the brand book dictates)
```
HEADER FONT: Oswald   (Regular + Bold)
  - CAPS: ONLY for short 2–3 word headers.
  - Longer headers/sentences: 'Sentence case' (NOT caps).

BODY FONT: Montserrat  (Regular, Medium, SemiBold)
  - All sentences in 'Sentence case'.
  - CAPS only for short section headers.
```
Both fonts are free on Google Fonts — load via `next/font/google`.

### Logo / motif
- The brand uses a fine-line script "Logo" mark (a circle with signature-style script).
  Use a placeholder logo slot top-left on each screen; Vishal will supply the final asset.
  Do NOT invent a logo. (The old "4-square mark" idea is dropped — follow the brand
  book's actual script-logo direction; leave a clean placeholder.)

### Visual tone (from the brand book moodboard — these 4 descriptors guide everything)
- **"Natural, in the moment"** — warm, human, not staged or corporate.
- **"Serious, but not dramatic"** — calm and grounded, no hype, no loud gradients.
- **"Informative, not preachy"** — clean, clear, respectful of the reader.
- **"Outcome based"** — focused on the result/insight for the father.

Translate to: generous whitespace, warm, premium, calm. A serious self-assessment tool,
NOT a Buzzfeed quiz. No emojis in UI chrome. No playful bounce animations. Subtle,
confident transitions only.

### Results page layout (suggested, on-brand)
1. Header band (Slate Blue #2F4F5C) — archetype name large in Oswald, one-line tagline in Montserrat.
2. Radar chart (5 axes: Consistency, Ownership, Relationships, Daily Initiative, Work Integration) with Muted Gold (#C58A2B) fill + 5 horizontal score bars beside it. Subtly tint the Work axis so the work-vs-home contrast reads at a glance.
3. Diagnosis text block — Montserrat, Dark Gray (#505050), generous line height, on White.
4. "Your First Shift" highlighted card — Burnt Orange (#D96C2F) left border, white card.
5. Soft bridge block — Slate Blue (#2F4F5C) background, White text.
6. Download button (Burnt Orange) + script-logo placeholder + footer.

---

## 9. ADMIN PANEL SPEC

Route: `/admin` (password-gated via `ADMIN_PASSWORD`).

**Login:** single password field → POST to `/api/admin/login` → sets signed httpOnly cookie → redirect to dashboard. All `/admin/*` and `/api/admin/*` routes check the cookie server-side.

**Dashboard shows:**
- Top stat cards: total submissions, submissions today, most common archetype, average overall score
- Archetype distribution (small bar chart)
- Table of submissions (newest first): Date | Name | Email | Phone | City | Archetype | Overall score | [View]
- Search box (filter by name/email/city)
- "Export CSV" button → downloads all submissions (all fields incl. raw answers + diagnosis)

**Submission detail view (`/admin/[id]`):**
- All lead info
- The 5 scores + radar chart
- Full AI diagnosis + focus shift
- All raw answers including the two open-text responses
- Timestamp, model used

---

## 10. API ROUTES

```
POST /api/submit
  body: { name, email, phone, city, answers[] }
  → validate
  → compute 5 scores + overall
  → determineArchetype()
  → call Anthropic for diagnosis + focusShift (with fallback)
  → save Submission to DB
  → return { archetype, scores, diagnosis, focusShift }

POST /api/admin/login
  body: { password } → set cookie or 401

GET  /api/admin/submissions   (auth)   → list (paginated)
GET  /api/admin/submissions/:id (auth) → one full record
GET  /api/admin/export        (auth)   → CSV stream
```

Validation: all lead fields required, email format check, answers must cover all 12 scored questions. Rate-limit `/api/submit` lightly (e.g. per-IP) to avoid abuse during a public webinar.

---

## 11. EDGE CASES & LIVE-WEBINAR HARDENING

- **AI down / slow:** always fall back to the per-archetype pre-written diagnosis. Never show an error during a live webinar.
- **Double submit:** debounce the submit button; one submission per click.
- **Mobile-first:** most fathers will do this on their phone during the webinar. Design mobile-first. Big tap targets for MCQ options.
- **Load spike:** the whole batch hits at once when Vishal drops the link mid-webinar. Make sure the DB connection pool and hosting can handle a burst. Postgres (Supabase/Neon) handles this better than SQLite for concurrent writes — prefer Postgres for production.
- **Resume safety:** if a user refreshes mid-quiz, it's fine to restart (keep it stateless/simple for v1). Don't over-engineer.
- **Privacy:** add a one-line consent under the lead form: "By continuing, you agree to receive follow-up from Platform of Papas." Store consent implicitly via submission.

---

## 12. BUILD ORDER (stage it in Claude Code)

Build and test in this sequence — don't try to one-shot it:

1. **Scaffold** Next.js + Tailwind + Prisma. Add brand tokens to Tailwind config. Get the FFFC fonts loading.
2. **Data model** — write the Prisma schema (§3), run migration, confirm DB connects.
3. **Scoring engine** — pure functions: score each dimension + `determineArchetype()`. Unit-test with a few sample answer sets BEFORE wiring UI.
4. **Question flow UI** — intro page → lead capture form → 14 questions (one per screen or grouped, mobile-first) → "analysing" animation.
5. **/api/submit** — scoring + archetype + DB save (skip AI first, use fallback text), return results.
6. **Results page** — archetype, radar chart, bars, diagnosis, focus shift, soft bridge, download.
7. **Wire in the Anthropic API** (§6) with the fallback. Test the prompt output quality, tune tone.
8. **Admin panel** — login, dashboard, table, detail view, CSV export.
9. **Hardening** — fallbacks, mobile polish, rate limit, consent line.
10. **Deploy** to Vercel + Postgres. Test on a phone. Generate the QR code that Vishal drops in the webinar (points to the live URL).

---

## 13. DELIVERABLES CHECKLIST

- [ ] Public assessment flow (intro → lead → questions → analysing → results)
- [ ] Real AI-generated personalised diagnosis (with fallback)
- [ ] 6 archetypes with display copy
- [ ] 5-dimension scoring (incl. Work Integration) + radar chart
- [ ] Lead captured BEFORE results, stored in DB
- [ ] Soft bridge at end (no hard pitch)
- [ ] Download/print report
- [ ] Admin panel: login, submissions table, detail view, CSV export, basic stats
- [ ] Mobile-first, on-brand (FFFC tokens)
- [ ] Deployed + QR code generated

---

## 14. OPEN QUESTIONS FOR VISHAL / ARHAAN (decide before or during build)

1. **Email automation:** Should a copy of the report auto-email to the father (and/or notify Vishal on each submission)? v1 can skip; easy to add later via Resend/SendGrid. Capturing the lead is the priority.
2. **Domain:** What URL? (e.g. `assessment.platformofpapas.com`). Needed for the QR code.
3. **Consent / privacy wording:** confirm the exact line under the form.
4. **Archetype names:** approve the 6 names, or tweak (e.g. cultural fit for Indian audience).
5. **Post-webinar reuse:** keep it live permanently as a top-of-funnel lead magnet (recommended) or webinar-only?
