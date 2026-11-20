# AVA — Coming soon

A responsive, dependency-free coming-soon page for AVA Brebu. It uses the exact pizza photo and logo from the Figma design, with self-hosted Instrument Serif and DM Sans fonts.

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

The domain and hosting provider have not been selected yet. No production deployment has been configured or performed. Once chosen, add the final canonical URL and absolute Open Graph image URL to `dist/index.html`, and configure the domain with the hosting provider.

## Files

- `dist/index.html`: Romanian content and metadata.
- `dist/styles.css`: desktop layout and mobile/tablet adjustments.
- `dist/assets/`: original Figma image and SVG logo.
- `dist/assets/fonts/`: font files and their SIL Open Font License notices.
- `scripts/serve.mjs`: local preview server; not required by production hosting.

The visible text uses Romanian diacritics: “În curând. Cu drag.” There is no made-up launch date, contact detail, countdown, or email signup.
