# QVAC Nickname Generator

Enter a name and an on-device AI suggests 5 friendly nickname ideas. No cloud call, no API key.

## Run

```bash
npm install
npm start
```

Then open http://localhost:32031

## QVAC SDK version

`@qvac/sdk` ^0.19.0 (see `package.json`).

## How it works

Built on [Tether's QVAC SDK](https://www.npmjs.com/package/@qvac/sdk) — all inference runs on-device, no cloud call, no API key. The app loads `LLAMA_3_2_1B_INST_Q4_0` locally with `loadModel()`, generates with `completion()` (streamed via `tokenStream`), and releases the model with `unloadModel()` on shutdown.

Type a first name into the form and submit it. The server sends the model a short system prompt plus two few-shot examples (so it learns the "one nickname per line" format instead of writing prose), then streams back its reply token by token via `tokenStream` and assembles it into a list. The response is parsed into individual nickname lines, checked for refusal phrases or bad formatting, and rendered as a list of chips. If the model output looks unusable, a deterministic fallback (name-based suffixes like "-y" or "-ster") is shown instead so the page never comes back empty.

**Example**

- Input: `Alexander`
- Output: `Alex`, `Lex`, `Alfie`, `Ali`, `Sandy`

## License

MIT
