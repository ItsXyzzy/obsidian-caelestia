#!/usr/bin/env node
/**
 * sync-scheme.mjs — regenerate the palette blocks in `theme.css` from a
 * live Caelestia colour scheme.
 *
 * Caelestia writes the active scheme to:
 *   $XDG_STATE_HOME/caelestia/scheme.json   (~/.local/state/caelestia/scheme.json)
 *
 * Usage
 *   node scripts/sync-scheme.mjs                    # read the live scheme
 *   node scripts/sync-scheme.mjs path/to/scheme.json
 *   node scripts/sync-scheme.mjs --mode light scheme.json
 *   node scripts/sync-scheme.mjs ~/.cache/caelestia/schemes/<id>/content/default/dark.json
 *
 * The script understands both the state file (`{ colours, mode }`) and the
 * flat per-mode files Caelestia caches (`{ primary, onPrimary, ... }`).
 * Only the block for the detected mode is rewritten.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const THEME = join(ROOT, "theme.css");

/* -------------------------------------------------------------------------- */
/* args                                                                        */
/* -------------------------------------------------------------------------- */

const argv = process.argv.slice(2);
let mode = null;
let file = null;

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === "--mode" || arg === "-m") mode = argv[++i];
  else if (arg === "--help" || arg === "-h") {
    console.log(
      "Usage: node scripts/sync-scheme.mjs [--mode dark|light] [scheme.json]"
    );
    process.exit(0);
  } else file = arg;
}

const stateHome = process.env.XDG_STATE_HOME || join(homedir(), ".local/state");
file = file || join(stateHome, "caelestia", "scheme.json");

/* -------------------------------------------------------------------------- */
/* colour helpers                                                              */
/* -------------------------------------------------------------------------- */

const hex = (value) => {
  if (value == null) return null;
  let s = String(value).trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(s)) s = s.replace(/./g, (c) => c + c);
  return /^[0-9a-f]{6}$/i.test(s) ? "#" + s.toLowerCase() : null;
};

const raw = JSON.parse(readFileSync(file, "utf8"));
const colours = raw.colours && typeof raw.colours === "object" ? raw.colours : raw;
mode = String(mode || raw.mode || "").toLowerCase();

if (!["dark", "light"].includes(mode)) {
  console.error(
    `✗ Could not determine mode (got "${mode}"). Pass --mode dark|light.`
  );
  process.exit(1);
}

/** First scheme key that resolves to a valid hex, else the fallback. */
const used = { live: 0, fallback: 0 };
const pick = (keys, fallback) => {
  for (const key of keys) {
    const value = hex(colours[key]);
    if (value) {
      used.live++;
      return value;
    }
  }
  used.fallback++;
  return fallback;
};

/* -------------------------------------------------------------------------- */
/* role → custom-property mapping                                              */
/* -------------------------------------------------------------------------- */

const groups = [
  {
    title: "neutrals",
    vars: [
      [["base", "background"], "base", "#0c0e12"],
      [["mantle"], "mantle", "#0c0e12"],
      [["crust"], "crust", "#0b0d11"],
      [["surface", "background"], "surface", "#0c0e12"],
      [["surfaceDim"], "surface-dim", "#0c0e12"],
      [["surfaceBright"], "surface-bright", "#282c34"],
      [["surfaceContainerLowest"], "surface-lowest", "#000000"],
      [["surfaceContainerLow"], "surface-low", "#111418"],
      [["surfaceContainer"], "surface-container", "#161a1f"],
      [["surfaceContainerHigh"], "surface-high", "#1c2026"],
      [["surfaceContainerHighest"], "surface-highest", "#21262d"],
      [["surfaceVariant"], "surface-variant", "#21262d"],
    ],
  },
  {
    title: "foreground",
    vars: [
      [["text", "onSurface", "onBackground"], "text", "#e2e5ef"],
      [["subtext1", "onSurfaceVariant"], "subtext1", "#a7abb4"],
      [["subtext0", "outline"], "subtext0", "#71767e"],
      [["overlay2"], "overlay2", "#63676f"],
      [["overlay1"], "overlay1", "#54585e"],
      [["overlay0"], "overlay0", "#46494f"],
      [["surface0"], "surface0", "#1b1d22"],
      [["surface1"], "surface1", "#2a2d32"],
      [["surface2"], "surface2", "#383b41"],
      [["outline"], "outline", "#71767e"],
      [["outlineVariant"], "outline-variant", "#444850"],
    ],
  },
  {
    title: "accent roles",
    vars: [
      [["primary", "mauve", "blue"], "primary", "#b0c8ec"],
      [["primaryDim", "mauve", "blue"], "primary-dim", "#a2bade"],
      [["onPrimary", "mantle", "base"], "on-primary", "#2a415f"],
      [["primaryContainer", "surface1"], "primary-container", "#3c5472"],
      [["onPrimaryContainer", "text"], "on-primary-container", "#d4e4ff"],
      [["secondary", "lavender", "sapphire"], "secondary", "#bbc7db"],
      [["onSecondary", "base"], "on-secondary", "#354151"],
      [["secondaryContainer", "surface1"], "secondary-container", "#313c4c"],
      [["onSecondaryContainer", "text"], "on-secondary-container", "#b4c0d4"],
      [["tertiary", "pink", "mauve"], "tertiary", "#e2d7ff"],
      [["onTertiary", "base"], "on-tertiary", "#514871"],
      [["tertiaryContainer", "surface1"], "tertiary-container", "#d4c8f9"],
      [["onTertiaryContainer", "text"], "on-tertiary-container", "#484068"],
    ],
  },
  {
    title: "state roles",
    vars: [
      [["error", "red"], "error", "#fa746f"],
      [["errorDim", "maroon", "red"], "error-dim", "#c54d4a"],
      [["onError", "base"], "on-error", "#490006"],
      [["errorContainer", "surface1"], "error-container", "#871f21"],
      [["onErrorContainer", "text"], "on-error-container", "#ff9993"],
      [["success", "green"], "success", "#b5ccba"],
      [["onSuccess", "base"], "on-success", "#213528"],
      [["successContainer", "surface1"], "success-container", "#374b3e"],
      [["onSuccessContainer", "text"], "on-success-container", "#d1e9d6"],
      [[], "warning", mode === "light" ? "#7a5900" : "#e0a06a"],
      [[], "on-warning", mode === "light" ? "#ffffff" : "#3f2e14"],
    ],
  },
  {
    title: "inverse / misc",
    vars: [
      [["inverseSurface"], "inverse-surface", "#f9f9fe"],
      [["inverseOnSurface"], "inverse-on-surface", "#535559"],
      [["inversePrimary"], "inverse-primary", "#49607f"],
      [["shadow"], "shadow", "#000000"],
      [["scrim"], "scrim", "#000000"],
      [["surfaceTint", "primary"], "surface-tint", "#b0c8ec"],
    ],
  },
  {
    title: "syntax",
    vars: [
      [["term7", "text"], "code-normal", "#ccdcd6"],
      [["subtext0", "overlay0", "overlay1", "term8"], "code-comment", "#71767e"],
      [["term3", "green", "teal"], "code-string", "#75fcdd"],
      [["term9", "mauve", "blue"], "code-keyword", "#a29eff"],
      [["term10", "sapphire", "sky", "blue"], "code-function", "#89ecff"],
      [["term5", "peach", "yellow"], "code-number", "#96a7ef"],
      [["term14", "lavender", "sapphire"], "code-property", "#b0e2ff"],
      [["term12", "sky", "blue"], "code-operator", "#abc4d8"],
      [["term1", "blue", "sapphire"], "code-tag", "#8383ff"],
      [["term12", "subtext1", "overlay2"], "code-punctuation", "#a7abb4"],
    ],
  },
  {
    title: "graph / canvas",
    vars: [
      [["primary"], "graph-node", "#b0c8ec"],
      [["outlineVariant"], "graph-line", "#444850"],
      [["primary"], "canvas-1", "#b0c8ec"],
      [["green", "term3"], "canvas-2", "#75fcdd"],
      [["mauve", "pink"], "canvas-3", "#e0c2f9"],
      [["sky", "teal"], "canvas-4", "#d0f9f4"],
      [["red", "error"], "canvas-5", "#ff9993"],
      [["peach", "yellow"], "canvas-6", "#a29eff"],
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* emit                                                                        */
/* -------------------------------------------------------------------------- */

const start = `/* @caelestia:palette:${mode}:start */`;
const end = `/* @caelestia:palette:${mode}:end */`;

const lines = [start, `.theme-${mode} {`];
for (const group of groups) {
  lines.push(`  /* ${group.title} */`);
  for (const [keys, name, fallback] of group.vars) {
    lines.push(`  --c-${name}: ${pick(keys, fallback)};`);
  }
  lines.push("");
}
lines.push(`  color-scheme: ${mode};`);
lines.push("}");
lines.push(end);
const generated = lines.join("\n").replace(/\n\n(color-scheme)/, "\n$1");

let css = readFileSync(THEME, "utf8");
const pattern = new RegExp(
  `${start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${end.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  )}`
);

if (!pattern.test(css)) {
  console.error(`✗ Markers for "${mode}" not found in theme.css.`);
  process.exit(1);
}

css = css.replace(pattern, generated);
writeFileSync(THEME, css);

console.log(`✔ Synced ${mode} palette from ${file}`);
console.log(
  `  ${used.live} colours from the scheme, ${used.fallback} from fallbacks.`
);
if (used.fallback > groups.length / 2) {
  console.log(
    "  Note: many fallbacks were used — the scheme may use unusual keys."
  );
}
