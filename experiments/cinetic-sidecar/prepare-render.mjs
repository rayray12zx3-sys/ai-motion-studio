// No outside media, fonts or source projects. Only the already-root-locked
// @fontsource/noto-sans-tc package is used for the synthetic C2 sample.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeArtifacts } from "./adapter.mjs";

function fail(message) { throw new Error(message); }
function covered(cp, rangeText) {
  return rangeText.split(",").some((r) => {
    const match = /^\s*U\+([0-9A-F]{1,6})(?:-([0-9A-F]{1,6}))?\s*$/i.exec(r);
    if (!match) fail("unrecognized font unicode-range");
    return cp >= parseInt(match[1], 16) && cp <= parseInt(match[2] || match[1], 16);
  });
}
const sha256 = (s) => createHash("sha256").update(s).digest("hex");

export function prepareSyntheticRender(input, dir) {
  const output = resolve(dir);
  const { dir: written } = writeArtifacts(input, output);
  const plan = JSON.parse(readFileSync(join(written, "validated-plan.json"), "utf8"));
  const pkg = fileURLToPath(import.meta.resolve("@fontsource/noto-sans-tc/package.json"));
  const root = dirname(pkg);
  const css = readFileSync(join(root, "400.css"), "utf8");
  const blocks = [...css.matchAll(/@font-face\s*\{[^}]*\}/g)].map((m) => m[0]);
  if (blocks.length === 0) fail("font CSS face list is empty");
  const copy = [...new Set(plan.beats.flatMap((b) => [...b.onScreenText]))].join("");
  const cps = [...copy].map((c) => c.codePointAt(0));
  const selected = new Set();
  for (const cp of cps) {
    const matching = blocks.findIndex((b) => {
      const m = b.match(/unicode-range:\s*([^;]+);/);
      return m && covered(cp, m[1]);
    });
    if (matching < 0) fail("pinned font has no Unicode block for U+" + cp.toString(16));
    selected.add(matching);
  }
  const fontDir = join(output, "fonts");
  mkdirSync(fontDir, { recursive: true });
  const manifest = [];
  let fontCss = "";
  for (const index of [...selected].sort((a, b) => a - b)) {
    const face = blocks[index];
    const fileName = face.match(/url\(\s*["']?\.\/files\/([^)"']+)/)?.[1];
    if (!fileName || !/^[a-z0-9._-]+\.woff2$/.test(fileName)) fail("font source file does not match locked package");
    const src = join(root, "files", fileName);
    if (!existsSync(src)) fail("font is missing on this runtime: " + fileName);
    const contents = readFileSync(src);
    copyFileSync(src, join(fontDir, fileName));
    manifest.push({ name: fileName, sha256: sha256(contents), bytes: contents.length });
    fontCss += face
      .replace(/font-family:\s*(['"])Noto Sans TC\1\s*;/, "font-family:'PinnedNotoTC';")
      .replace(/url\(\s*["']?\.\/files\//g, "url('./fonts/")
      .replace(/font-display:\s*swap;/g, "font-display:block;") + "\n";
  }
  let html = readFileSync(join(output, "index.html"), "utf8");
  if (!html.includes("font-family:sans-serif")) fail("generated HTML font contract changed");
  html = html.replace("font-family:sans-serif", "font-family:'PinnedNotoTC'")
    .replace("font-weight:700", "font-weight:400")
    .replace("</style>", fontCss + "</style>");
  // Every output font is local; only synthetic HTML/JSON/video gets archived.
  writeFileSync(join(output, "index.html"), html, { flag: "w" });
  let alpha = html.replaceAll("background:#0c1220", "background:transparent")
    .replaceAll("background:#121d2b", "background:transparent");
  if (alpha === html || alpha.includes("background:#121d2b")) fail("alpha background conversion failed");
  writeFileSync(join(output, "index-alpha.html"), alpha, { flag: "wx" });
  writeFileSync(join(output, "font-qa.json"), JSON.stringify({
    status: "FONT_SOURCE_VERIFIED_NOT_CREATIVE_APPROVAL",
    sourcePackage: "@fontsource/noto-sans-tc@5.3.0",
    requiredCharacters: copy,
    resolvedFontFiles: manifest,
    fontFamily: "PinnedNotoTC",
    productionUse: false,
  }, null, 2) + "\n", { flag: "wx" });
  return { dir: written, manifest };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 4) fail("Usage: node prepare-render.mjs <public-synthetic.json> <new-output-dir>");
    const input = JSON.parse(readFileSync(process.argv[2], "utf8"));
    const result = prepareSyntheticRender(input, process.argv[3]);
    console.log("FONT_LOCKED_SYNTHETIC_RND_ONLY", result.manifest.length, "font shards");
  } catch (error) { console.error("PREPARE_REJECTED", error.message); process.exitCode = 1; }
}
