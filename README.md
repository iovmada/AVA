# AVA Brebu

A static Romanian website for AVA Brebu. The site includes the homepage, pizzeria, restaurant and accommodation pages.

- [Figma homepage](https://www.figma.com/design/32nTqabvleQHyiAQThl7D4/Swissstaffing_local_DP?node-id=1597-2)
- [GitHub repository](https://github.com/iovmada/AVA)

## Local preview

Requires Node.js 18 or newer and no package installation.

```sh
npm run build
npm run dev
```

Open http://127.0.0.1:4173. Set `PORT` to use a different port.

The templates and menu data live in `site/`. Run `npm run build` after editing them to regenerate the HTML in `dist/`. CSS, browser JavaScript, fonts and images live directly in `dist/`.

## Hosting

Publish `dist/` as a static site. GitHub's `main` branch feeds the production DigitalOcean app at https://www.ava-brebu.ro. The full website is developed on `ava/full-website`; production currently serves the coming-soon page.

Before launch, confirm the proposed menu, room rates and hours, add the business's reservation and contact details, and complete the menu categories for which the design contains no listings.
