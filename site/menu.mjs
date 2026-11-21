import { readFileSync } from 'node:fs';
import schema from '../functions/packages/menu/propose/menu-data.js';

const contents = readFileSync(new URL('menu.json', import.meta.url));
export const menu = JSON.parse(contents);
export const menuVersion = schema.hash(contents);
export const { categories } = schema;
schema.validateProposal(menu, menu);
for (const item of menu) {
  if (item.photo) {
    if (!/^[a-z0-9-]+\.webp$/.test(item.photo)) throw new Error('Invalid menu photo filename.');
    readFileSync(new URL(`../dist/assets/site/${item.photo}`, import.meta.url));
  }
}
