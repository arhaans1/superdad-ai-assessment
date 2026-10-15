# Assessment question update — 15 October 2026

The seven-gap assessment retains its 21 scored questions, their IDs, gap assignments,
five numeric choices (0–4), weights, and archetype rules. Higher values still mean
a greater gap. Only the choice wording changes, including stage-specific choices
for shared family responsibilities and presence.

Earlier wording was reviewed in `SuperDad_Assessment_BUILD_SPEC.md` and the original
`lib/questions.ts` in Git history. Phrases such as “Take initiative to understand
and address it directly” and “We split it, but she carries more” were reused or
adapted where they fit the current question. Older questions about minutes spent
together, colleagues, or rituals were not substituted for the current constructs.

The final question is copied verbatim from the live pre-webinar questionnaire:

> What does redefining fatherhood mean to you?

Source: https://api.leadconnectorhq.com/widget/form/58CgrcPgb4xikt4rJ5JP

The source is a required multi-line text field with the question repeated as its
placeholder. There are no response options or scoring. The assessment uses the
same format as `q24`, after the two existing reflections and before lead submission.
It is saved in the existing lead `answers` JSON, shown on the admin lead detail,
and exported both in `answers` and a separate `fatherhoodReflection` CSV column.
No database migration is needed.

New submissions are marked `intentional-father-v2.1`. Existing
`intentional-father-v2` submissions retain their original agreement/frequency
labels in admin so historical responses are not relabelled as new answers.
