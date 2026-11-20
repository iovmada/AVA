# AVA — Coming soon

A responsive, dependency-free coming-soon page for AVA Brebu. The supplied pizza photo fills the viewport, with smaller WebP images and a portrait crop for narrow screens. The original AVA logo and self-hosted Instrument Serif and DM Sans fonts are included.

Design: https://www.figma.com/design/32nTqabvleQHyiAQThl7D4/Swissstaffing_local_DP?node-id=1691-443

Repository: https://github.com/iovmada/AVA

## Preview locally

Requires Node.js 18 or newer. No package installation or build step is needed.

```sh
npm run dev
```

Open http://127.0.0.1:4173. Set `PORT` to use a different local port.

## Hosting

Publish the **`dist`** directory on a static host. The build command can be left empty. All assets are local and all paths are relative, so the page also works under a subdirectory.

Production uses DigitalOcean App Platform with the `main` branch and `dist` as the static output directory. The public address is https://www.ava-brebu.ro.

## Files

- `dist/index.html`: Romanian content and metadata.
- `dist/styles.css`: desktop layout and mobile/tablet adjustments.
- `dist/assets/`: responsive pizza photos and the original SVG logo.
- `dist/assets/fonts/`: font files and their SIL Open Font License notices.
- `scripts/serve.mjs`: local preview server; not required by production hosting.

The visible text uses Romanian diacritics: “În curând. Cu drag.” There is no made-up launch date, contact detail, countdown, or email signup.
