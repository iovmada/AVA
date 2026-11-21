import { copyFile, cp, mkdir, writeFile } from 'node:fs/promises';
import { adminPage } from './admin.mjs';
import { menu } from './menu.mjs';

const source = new URL('../dist/', import.meta.url);
const output = new URL('../menu-preview/', import.meta.url);
const files = [
  'styles.css',
  'admin/editor.css',
  'admin/editor.js',
  'assets/ava-logo.svg',
  'assets/site/home-footer-logo.svg',
  ...new Set(menu.filter(item => item.photo).map(item => `assets/site/${item.photo}`)),
];

await Promise.all(['admin/', 'assets/site/'].map(directory =>
  mkdir(new URL(directory, output), { recursive: true })));

await Promise.all([
  ...files.map(file => copyFile(new URL(file, source), new URL(file, output))),
  cp(new URL('assets/fonts/', source), new URL('assets/fonts/', output), { recursive: true }),
  writeFile(new URL('admin/index.html', output), adminPage({ publicPreview: true })),
  writeFile(new URL('robots.txt', output), 'User-agent: *\nDisallow: /\n'),
  writeFile(new URL('index.html', output), `<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="0; url=./admin/">
  <title>Previzualizare meniu · AVA Brebu</title>
</head>
<body><a href="./admin/">Deschide editorul de test</a></body>
</html>
`),
]);
