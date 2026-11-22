import { pizzaPage } from './pizzeria-page.mjs';

export function pizzeriaPreview(menu) {
  return pizzaPage(menu, { pizzeria: ['Pizza', 'Paste', 'Salate', 'Deserturi', 'Băuturi'] })
    .replace('<head>', '<head>\n  <meta name="robots" content="noindex">')
    .replaceAll('href="../"', 'href="https://www.ava-brebu.ro/"')
    .replaceAll('href="../restaurant/', 'href="https://www.ava-brebu.ro/restaurant/')
    .replaceAll('href="../casa/', 'href="https://www.ava-brebu.ro/casa/');
}
