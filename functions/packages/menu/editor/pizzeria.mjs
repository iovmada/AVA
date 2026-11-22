import { layoutFor, menuPanel } from './shared.mjs';

const categories = ['Pizza', 'Paste', 'Salate', 'Deserturi', 'Băuturi'];

export function pizzeriaPreview(menu) {
  const ui = layoutFor('pizzeria');
  const items = menu.filter(item => item.section === 'pizzeria' && item.active);
  return `<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Meniul pizzeriei · AVA Brebu</title>
  <link rel="icon" href="../assets/ava-logo.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../styles.css">
  <script src="../site.js" defer></script>
</head>
<body class="page-pizzeria">
  <header class="action-band wrap">
    <div>
      <p class="kicker">Meniu de test</p>
      <h1>Meniul pizzeriei</h1>
    </div>
    <a class="pill pill--outline" href="../admin/">Înapoi la editor</a>
  </header>
  <main>
    ${menuPanel(ui, {
      title: 'Ce-ți face poftă?', caption: 'Alege. Împarte. Mai ia o felie.',
      categories, items, texture: 'pizza-menu-texture.webp', tone: 'wine',
    })}
  </main>
</body>
</html>`;
}
