# SRS Trainer — Project Documentation

## Overview

A lightweight vocabulary trainer for language learning, built with spaced repetition (SRS). Originally built for Korean but designed to be language-agnostic. Deployed on GitHub Pages.

There is no build step, no dependencies, no backend. Everything runs in the browser. Data persists in `localStorage`. AI features call the Anthropic API directly from the browser using a user-supplied API key.

---

## File Structure

```
srs-trainer/
  index.html       ← markup only
  style.css        ← all styles (variables, components, responsive)
  app.js           ← all application logic
  readme.md
```

### app.js sections

| Section | Description |
|---------|-------------|
| Constants & Config | Prompts, SRS intervals, session sizes |
| SVG Icons | Inline SVG constants (chevrons, arrows, mic) |
| Utilities | XSS escaping, string normalization |
| Database / LocalStorage | CRUD for word bank and settings |
| Spaced Repetition Logic | Due checks, interval calculation, streak tracking |
| State | Session queue, phase tracking, global variables |
| API Key | Save/remove/render API key UI |
| UI Rendering: Home | Stats, due summary, session sizes |
| UI Rendering: Collapsible Sections | Toggle logic for themes, add words, word bank |
| UI Rendering: Themes | Theme list, filter pills, AI grouping |
| UI Rendering: Word Bank | Word rows, edit/delete, rendering |
| Adding Words | Single add, bulk paste, similar-word detection |
| Session Flow | Start, phase rendering, rating, end |
| AI Integration | Feedback scoring, story generation, theme grouping |
| Import / Export | JSON export/import with merge logic |
| Voice Recognition | Web Speech API for round 2 |
| Keyboard Shortcuts | Desktop hotkeys for session navigation |

---

## Session Structure

Each review session cycles through **4 rounds**, processing all words in each round before moving to the next:

| Round | Name | Description |
|-------|------|-------------|
| 1 | See it | Korean word shown, reveal meaning, self-rate: knew it / vaguely / forgot |
| 2 | Say it | English shown, speak Korean word into mic (Web Speech API) |
| 3 | Pair it | Multiple choice — pick the natural collocation for the word (requires API key) |
| 4 | Use it | Write a sentence using the word (12 rotating prompts, feeds end-of-session story) |

Sessions default to 5 words. Hard words are prioritised, then shuffled randomly within each group.

---

## SRS Logic

Words have `level` (0–4) and `hardCount`. After round 1, each word's next review date is set:

```js
const INTERVALS = {
  good: [1, 3, 7, 14, 30],
  ok:   [1, 2, 4, 10],
  hard: [0, 0, 1, 2]
};
```

- `good` → level up, hardCount decremented
- `hard` → level down, hardCount incremented
- Words are "due" when `nextReview <= today`

---

## Word Bank Data Shape

Each word in `localStorage` key `kr_srs`:

```json
{
  "words": {
    "갑자기": {
      "ko": "갑자기",
      "en": "suddenly",
      "level": 2,
      "hardCount": 0,
      "nextReview": "2026-03-25",
      "added": "2026-03-01",
      "theme": "time & manner"
    }
  },
  "sessions": 14,
  "streak": 3,
  "lastDate": "2026-03-21"
}
```

---

## AI Features

All AI features require an Anthropic API key (`sk-ant-...`) saved via the `···` menu. The key is stored in `localStorage` under `kr_srs_apikey` and sent directly to `https://api.anthropic.com/v1/messages` from the browser. Model: `claude-sonnet-4-6`.

| Feature | Trigger | Description |
|---------|---------|-------------|
| AI feedback | Button in rounds 3 & 4 (or `⌘↵`) | Scores the sentence (great / good / needs work), gives specific feedback, suggests a rewrite |
| End-of-session story | Auto on session complete | Weaves all use-it sentences into a short absurd/funny Korean story with English translation. Vocab words highlighted in teal |
| Theme grouping | Auto on word add, or manual refresh | Clusters entire word bank into 3–8 themes using a single API call, stores theme on each word |

The `anthropic-dangerous-direct-browser-access: true` header is required for browser-direct API calls.

---

## Voice Input (Round 2)

Uses the browser's native `SpeechRecognition` / `webkitSpeechRecognition` API. Language: `ko-KR`. Up to 5 alternatives are checked against the expected word.

- Correct → shows heard word in teal, "correct →" button
- Wrong → shows heard word, "retry" and "give up" buttons. Give up reveals the answer
- Spacebar toggles mic on/off during round 2
- Requires HTTPS (works on GitHub Pages and localhost, not `file://` on Chrome)
- Supported: Chrome, Edge, Safari (iOS 14.5+). Not supported: Firefox

---

## Home Screen Layout

From top to bottom:

1. Streak indicator + last session date
2. Stats grid (total words / due today / struggling / sessions)
3. **Today's queue** — due count, theme filter pills, start review button
4. **Themes** — collapsible, shows theme name + word count + due count per theme
5. **Struggling words** — words with `hardCount >= 2`
6. **Add words** — collapsible, single word entry or bulk paste
7. **Word bank** — collapsible, all words with next review date, remove button per word

---

## Bulk Paste Format

Accepts any of these separators between Korean word and definition. Commas and semicolons are intentionally excluded so definitions like "to be flustered, embarrassed" parse correctly.

```
갑자기 suddenly
갑자기 - suddenly
갑자기 – suddenly
갑자기 — suddenly
갑자기: suddenly
```

---

## Keyboard Shortcuts (desktop only, hidden on mobile)

| Key | Action |
|-----|--------|
| `space` | Round 1: reveal meaning. Round 2: toggle mic |
| `1` / `2` / `3` | Round 1: rate word. Round 3: select collocation option |
| `4` | Round 3: select 4th collocation option |
| `⌘↵` / `ctrl↵` | Trigger AI feedback (round 4) |
| `enter` | Round 4: advance |

Mobile is detected via `navigator.userAgent`. Shortcuts are suppressed inside textareas and inputs.

---

## Export / Import

Via the `···` menu. Exports a dated JSON file (`korean-srs-YYYY-MM-DD.json`). Import merges word banks intelligently: new words are added, existing words keep the higher level/hardCount from either file. Sessions, streak, and lastDate take the max of both files.

---

## Local Development

```bash
cd ~/Github/srs-trainer
python3 -m http.server 8000
# open http://localhost:8000
```

Or with auto-reload:
```bash
npx live-server --port=8000
```

---

## Deployment

GitHub Pages from the `main` branch root. Push to `main` → auto-deploys in ~60 seconds. API calls work on GitHub Pages (HTTPS). `localStorage` persists per-browser, per-device — use export/import to sync across devices.

---

## Known Constraints / Future Work

- `localStorage` only — no cross-device sync. Export/import is the manual workaround. Supabase integration was discussed as a future upgrade.
- Theme grouping is Korean-specific in the AI prompt but everything else is language-agnostic. Multi-language support (language switcher + config object) was discussed but not built.
- The `···` menu API key section shows "key saved ✓" with replace/remove buttons when a key exists, and a password input when it doesn't.
- Story tone is locked to funny/absurd. Was originally configurable but simplified by user preference.
- `del-btn` class is used for edit/remove actions in the word bank. Collapsible sections use `section-head.clickable` with inline SVG chevron icons that swap between right (collapsed) and down (expanded). `caret-btn` class exists in CSS but is no longer used in the UI.
