<div align="center">

<img src="icons/icon128.png" width="96" height="96" alt="Sentence Grader icon" />

# Sentence Grader ✏️💜

**Less clicking. More encouraging. Occasional confetti.**

A friendly Chrome extension that helps teachers grade sentence-count responses in Google Forms, one little victory at a time.

![Version](https://img.shields.io/badge/version-1.0.0-673ab7) ![Manifest](https://img.shields.io/badge/Chrome-Manifest%20V3-673ab7) ![Privacy](https://img.shields.io/badge/Privacy-on--device-5f35a8)

</div>

---

## What it does

Some writing assignments ask students to write at least six complete sentences. Counting and scoring each response manually can take a while. Sentence Grader gives the teacher a head start while keeping them in control of the final grade.

- **Counts likely sentences** and proposes scores according to a simple rubric.
- **Flags uncertain answers** for manual review instead of automatically filling them.
- **Fills blank scores only**, preserving grades you've already entered.
- **Jumps to the next ungraded answer** with a gentle highlight on the Google Forms card and the matching preview.
- **Uses Google Forms' own Save grades control** rather than submitting grades through a separate service.
- **Celebrates progress** with personalized motivational toasts, optional confetti, and a tiny trumpet fanfare. 🎺
- **Remembers preferences**, including the grader's name. (Hi, Berlin! 👋)

All processing happens in your browser. No accounts, analytics, external grading API, or transmission of student responses.

## Quick start

1. Download the source ZIP or clone this repository.
2. Open Chrome and visit `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the folder containing `manifest.json`.
5. Open your Google Form editor, navigate to **Responses → Question**, and select the paragraph question you're grading.
6. Click the purple pencil-and-check button at the bottom-right of the page.

That's it! The extension scans currently visible answers when opened. No separate Scan button is needed.

> **Tip:** Load the unpacked *folder*, not the ZIP. Unzip first.

## The scoring rule

| Detected sentences | Proposed score |
| :---: | :---: |
| 0–3 | 3 points |
| 4 | 4 points |
| 5 | 5 points |
| 6 or more | 6 points |

This rubric is fixed in v1.0 and expects a **six-point** Google Forms question.

### The human-in-the-loop part

Sentence counting isn't the same as determining whether a sentence is grammatically complete. This extension uses local, rule-based detection and flags suspicious cases like fragments, numbered lists, and possible missing punctuation between sentences.

Some intentional conventions:

- A sentence without final punctuation can still count.
- Separate nonempty lines can count as separate sentences.
- An ellipsis is a sentence boundary.
- Repeated exclamation/question marks count as one boundary.
- Common abbreviations and decimal points are not sentence endings.
- A run-on without punctuation generally counts as one sentence.

**Always review the preview and scores before saving.** Students deserve a teacher's judgment, not a punctuation-only verdict.

## A typical grading session

1. **Open Sentence Grader.** The panel proposes counts and shows manual-review warnings.
2. Click **Fill blanks** to populate confidently detected, empty score fields.
3. Click **Next ungraded** to find a response that needs attention, highlighted in Google Forms and the extension preview.
4. Review or edit the grades.
5. Click **Save grades** in Google Forms, or use the extension's Save button when the native control is available.
6. When every visible response has a score, the all-done screen invites you to **Launch confetti!** You earned it. 🎉

The toolbar stays at the top while the answer preview scrolls.

## Make it yours

Open the gear icon in the extension header:

| Setting | What it changes |
| --- | --- |
| Encouragement toasts | Small purple progress messages |
| Finish-line confetti | Automatic confetti after an acknowledged final save |
| Celebration trumpet | Short locally synthesized fanfare |
| Grader name | Occasional personal encouragement; defaults to **Berlin** |

Preferences persist locally in Chrome. There's a **Test trumpet** button to check audio playback. Messages span decades, from “bee's knees” to “main-character energy,” and rotate to avoid repetition.

## Privacy and permissions 🔒

The manifest requests only the `storage` extension permission, which remembers the grader's name and celebration settings. The content script runs only on Google Forms editor URLs: `https://docs.google.com/forms/d/*/edit*`.

Student answers are read in-memory to count sentences and display a local preview. The extension doesn't send them anywhere, store them, or include them in reports. No third-party scripts, analytics, external fonts, or grading servers.

See [PRIVACY.md](PRIVACY.md) for more detail.

## Important limitations

- **Teacher-assist, not automated assessment.** Grammar and sentence completeness can be ambiguous.
- **Google Forms can change its HTML.** The extension depends on observed editor markup.
- **Visible cards define progress.** Identical answers may be grouped, and not-yet-rendered answers may be absent.
- **Google Forms handles saving.** The extension's UI feedback is not independent server-side confirmation. Reload and verify important grades persisted.
- **The rubric is hardcoded** and is not yet configurable.
- **Chrome desktop first.** Not a mobile Chrome extension.

Test with fictional responses before real classroom use.

## Development

No build system or runtime dependencies are required. It's plain JavaScript, CSS, SVG, and PNG.

```bash
npm test
npm run check
```

```text
sentence-grader/
├── manifest.json       Chrome Manifest V3 configuration
├── content.js          Google Forms integration and UI
├── grader.js           Sentence-counting logic
├── confetti.js         Local canvas confetti
├── icons/              SVG source and Chrome PNG icons
├── tests/              Sentence-counting tests
├── PRIVACY.md          Data handling and permissions
└── README.md           You are here
```

For browser diagnostics, open DevTools and filter the Console for `[Sentence Grader]`. Logs describe events and score counts, not student answer text.

## Contributing

Found a sentence edge case? Have a pun worthy of the confetti cannon? Open an issue with a **fictional** example and the result you expected. Please do not share real student submissions, names, or grades in GitHub issues or screenshots.

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Project status

**v1.0.0: first public source release.** Tested against synthetic Google Forms responses and a growing suite of sentence edge cases. Google Forms UI compatibility is subject to live checks as Google updates its editor.

Made with 💜 for teachers who deserve a little celebration after a lot of grading.
