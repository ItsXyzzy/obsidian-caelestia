# Caelestia — an Obsidian theme

[![Release](https://img.shields.io/github/v/release/alliseeislight/obsidian-caelestia?style=flat-square)](https://github.com/alliseeislight/obsidian-caelestia/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

**Material 3 / Material You, straight from the [Caelestia](https://github.com/caelestia-dots/shell) desktop shell to Obsidian.**

If you run Caelestia, this is the missing piece — your notes finally match your
bar, launcher, dashboard, and lock screen. Rounded, tonal, blurred, and driven by
the same design tokens the shell uses.

![Caelestia for Obsidian](screenshot.png)

## Features

- **Faithful Material 3 palette** — the light and dark schemes are generated
  from a real Caelestia colour scheme, with full tonal surfaces
  (`surface-container-lowest` → `surface-highest`).
- **Caelestia's exact design tokens** — rounding `4 / 8 / 12 / 16 / 20 / 28 / 32
  / 48 / full`, the shell's spacing scale, and Material's emphasized easing.
- **Squircle corners** — uses CSS `corner-shape: superellipse` for that Material
  expressive look (falls back gracefully on older builds).
- **Translucent + blurred** popovers, menus, and modals, mirroring the shell's
  `transparency.base` / `layers` settings.
- **Floating panes** — sidebars and note panes become rounded cards on a mantle
  background.
- **Bundled Rubik** (SIL OFL) so the theme looks right even without Google Sans
  Flex installed.
- **Style Settings support** — switch accent role, corner rounding, corner shape,
  translucency, flat/floating panes, and reading width without touching CSS.
- **Complete coverage** — editor, reading view, callouts, embeds, tables, code,
  properties, tags, Bases (1.9+), Canvas, and graph.
- **Sync script** — regenerate the palette from your live Caelestia scheme with
  one command.

## Installation

### From the community store

> Pending review — once published you can find it under
> **Settings → Appearance → Manage → Browse → Themes → Caelestia**.

### Manually

1. Download `theme.css` and `manifest.json` (or clone this repo).
2. Create a folder called `Caelestia` in your vault's `.obsidian/themes/`
   directory:

   ```sh
   mkdir -p "<your vault>/.obsidian/themes/Caelestia"
   cp theme.css manifest.json "<your vault>/.obsidian/themes/Caelestia/"
   cp -r fonts "<your vault>/.obsidian/themes/Caelestia/"
   ```

3. Open **Settings → Appearance → Themes** and select **Caelestia**.

> The `fonts/` folder is optional but recommended — without it the theme falls
> back to your system sans-serif.

### For the closest match to your shell

Caelestia's UI face is **Google Sans Flex**. It isn't redistributable, so the
theme falls back to the bundled **Rubik** and then your system font. If you have
Google Sans Flex installed, the theme picks it up automatically.

## Style Settings

Install [Style Settings](https://github.com/mgmeyers/obsidian-style-settings)
to unlock:

| Setting | Options |
| --- | --- |
| **Accent** | Primary · Secondary · Tertiary |
| **Corner rounding** | Caelestia · Pill · Square |
| **Corner shape** | Squircle · Round |
| **Opaque surfaces** | Disable blur/translucency |
| **Floating panes** | Detached rounded cards |
| **Reading width** | 560 – 1200px |

## Syncing with your live scheme

Caelestia writes its active colours to
`~/.local/state/caelestia/scheme.json`. Regenerate the theme palette from it:

```sh
node scripts/sync-scheme.mjs                       # live scheme, auto-detect mode
node scripts/sync-scheme.mjs --mode light scheme.json
node scripts/sync-scheme.mjs ~/.cache/caelestia/schemes/<id>/content/default/dark.json
```

**Keep it in sync automatically:**
```sh
# watch the live scheme, and copy straight into an Obsidian vault when it changes
node scripts/sync-scheme.mjs --watch --vault ~/Documents/Obsidian\ Vault
```
Obsidian hot-reloads `theme.css`, so a wallpaper change in the shell flows into your
notes within a second — no restart, no reinstall. Point `--vault` at any vault.

The script understands both the state file and the flat per-mode files
Caelestia caches, and only rewrites the block for the mode it detects.

## Development

```sh
git clone https://github.com/alliseeislight/obsidian-caelestia
cd obsidian-caelestia
# edit theme.css, then reload the theme in Obsidian
```

Releases are cut by pushing a tag; the workflow attaches `theme.css` and
`manifest.json` to a GitHub release, which is what Obsidian reads for updates.

## Credits

- Design language, tokens and palette: [Caelestia](https://github.com/caelestia-dots/shell)
  by [caelestia-dots](https://github.com/caelestia-dots).
- Bundled typeface: [Rubik](https://github.com/googlefonts/rubik) (SIL OFL 1.1).
- Material 3 colour system: Google.

## License

[MIT](LICENSE) © alliseeislight
