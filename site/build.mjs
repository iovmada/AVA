import { mkdir, writeFile } from 'node:fs/promises';
import { casaPage, homePage, pizzaPage, restaurantPage } from './pages.mjs';

const pages = [
  ['', homePage],
  ['pizzeria/', pizzaPage],
  ['restaurant/', restaurantPage],
  ['casa/', casaPage],
];

for (const [directory, render] of pages) {
  const destination = new URL(`../dist/${directory}`, import.meta.url);
  await mkdir(destination, { recursive: true });
  const html = render().replace(/[ \t]+$/gm, '');
  await writeFile(new URL('index.html', destination), html);
}
