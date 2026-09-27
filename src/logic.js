// QVAC Nickname Generator — core logic.
// completion() proposes 5 short, friendly nickname ideas for a given name.

import { completion } from "@qvac/sdk";

function looksUnusable(list, name) {
  if (!Array.isArray(list) || list.length === 0) return true;
  const bad = ["i cannot", "i can't", "as an ai", "i'm not able", "i am not able"];
  const joined = list.join(" ").toLowerCase();
  if (bad.some((phrase) => joined.includes(phrase))) return true;
  if (list.some((n) => !n || n.trim().length === 0 || n.length > 40)) return true;
  return false;
}

function fallback(name) {
  const base = (name || "Friend").trim().split(/\s+/)[0] || "Friend";
  const short = base.slice(0, Math.max(2, Math.min(base.length, 4)));
  const suffixed = [
    `${short}y`,
    `${short}ster`,
    `Big ${base}`,
    `${base} the Great`,
    `${short}-Bear`,
  ];
  return suffixed;
}

function parseList(text) {
  return text
    .split("\n")
    .map((line) => line.replace(/^[\s\-*\d.)]+/, "").trim())
    .filter((line) => line.length > 0);
}

export async function generate(modelId, name) {
  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content:
          "You invent short, friendly nicknames for people's first names. " +
          "Given a name, reply with exactly 5 nickname ideas, one per line, no numbering, no preamble, no explanation.",
      },
      { role: "user", content: "Name: Alexander" },
      {
        role: "assistant",
        content: "Alex\nLex\nAlfie\nAli\nSandy",
      },
      { role: "user", content: "Name: Isabella" },
      {
        role: "assistant",
        content: "Bella\nIzzy\nBelle\nIsa\nBells",
      },
      { role: "user", content: `Name: ${name}` },
    ],
    stream: true,
    // Lower than the original 0.8: traditional nicknames legitimately don't
    // always share letters with the name (e.g. "Sandy" for Alexander), so a
    // strict letter-overlap grounding check would reject valid results —
    // reducing randomness instead cuts down on fully unrelated fabrications
    // (e.g. "Xavier" appearing as a nickname for "Alexander").
    completionOpts: { temperature: 0.5, maxTokens: 80 },
  });

  let text = "";
  for await (const token of run.tokenStream) text += token;
  text = text.trim();

  let nicknames = parseList(text).slice(0, 5);
  if (looksUnusable(nicknames, name)) nicknames = fallback(name);

  return { nicknames };
}
