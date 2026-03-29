# Korean SRS Trainer

A spaced repetition vocabulary trainer for Korean. No accounts, no install — runs entirely in the browser.

## How it works

Add Korean words with their meanings. Each day, words that are due come back for review across 3–4 rounds:

1. **See it** — see the Korean word, reveal the meaning, rate how well you remembered
2. **Say it** — see the English, speak or type the Korean word
3. **Pair it** — pick the natural collocation for the word (requires API key)
4. **Use it** — write a sentence using the word with a creative prompt

Words you know well appear less often. Words you struggle with come back sooner.

## AI features (optional)

Add an Anthropic API key in the `···` menu to unlock:

- **Collocation quiz** — teaches natural word pairings (e.g. 훈련을 받다) via multiple choice
- **Sentence feedback** — scores your writing and suggests improvements
- **Story generation** — turns your sentences into a short funny Korean story at the end of each session
- **Theme grouping** — automatically organizes your word bank by topic

## Adding words

- **One at a time** — type the Korean word and meaning, click "add word"
- **Bulk paste** — paste a list with one word per line, e.g. `갑자기 suddenly`

## Syncing across devices

Your data lives in the browser. Use **export/import** in the `···` menu to move your progress between devices.

## Running locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Deployed via GitHub Pages — push to `main` to deploy.
