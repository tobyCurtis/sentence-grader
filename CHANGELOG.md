# Changelog

## 1.0.0

- First public-ready source release for Google Forms sentence-count grading.
- Local sentence counting with conservative manual-review flags.
- Blank-score fill, next-ungraded navigation, and Save grades integration.
- Sticky toolbar, purple-themed panel, all-done screen, and custom extension icon.
- Personalized motivation with configurable grader name.
- Optional confetti and synthesized fanfare with persisted preferences.
- Installation, privacy, and contribution documentation.
## 1.0.1 (test candidate)

- Prioritize sentence counting over grammar judgments; fragments, lists, and very short statements no longer block filling.
- Show sentence-count badges on Google Forms response cards and temporarily highlight strong missing-punctuation ambiguities with a hover explanation.
- Keep the grading panel below the active response's scoring field, shrinking as space gets tight and restoring its launcher when necessary.
- Hide already-scored answers from the normal review list, while retaining the option to revisit them.
- Add native correct/incorrect grading toasts, warmer low-score messages, and a slightly bigger, animated toast.
- Replace the trumpet checkbox with a saved volume slider (zero is mute).
- Teacher follow-up: switch to locally bundled Tippy.js and Popper, keeping hover explanations attached to moving underlines.
- Put sentence-count chips in their own row below answers instead of overlapping text.
- Align Next ungraded to the top of the answer card, so teachers can read downward toward the score.
- Add persistent settings for missing-punctuation review, line-break boundaries, and ellipsis boundaries.
- Refine Tippy.js hints after live testing: underline only the suspected sentence starts and show shorter, more compact, anchored tooltips.
- Give hover hints more breathing room and constrain Popper placement to the visible Google Forms scroll area, hiding off-screen marks as it moves.
- After a native Google Forms correct/incorrect click updates its score, automatically navigate to the next ungraded response.
- Make blank responses explain their state on the Forms card: ready to fill, requires review, or fill attempt not retained; verify filled values after Google Forms settles.
- Use 14 entirely fictional, activism-themed test responses modeled on realistic classroom length and punctuation patterns; relax false punctuation flags inside legitimate complex sentences.

