const { readFile, readdir } = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');

const folder = path.join(__dirname, 'public');
const editorUrl = '/api/menu/editor/admin/';
const pizzeriaUrl = '/api/menu/editor/pizzeria/';
const publicFiles = new Map([
  ['/admin/', 'admin/index.html'],
  ['/admin/access.js', 'admin/access.js'],
  ['/admin/editor.js', 'admin/editor.js'],
  ['/admin/editor.css', 'admin/editor.css'],
  ['/site.js', 'site.js'],
  ['/styles.css', 'styles.css'],
  ['/assets/ava-logo.svg', 'assets/ava-logo.svg'],
  ['/assets/site/home-footer-logo.svg', 'assets/site/home-footer-logo.svg'],
  ['/assets/site/pizza-header-logo.svg', 'assets/site/pizza-header-logo.svg'],
  ['/assets/site/pizza-menu-texture.webp', 'assets/site/pizza-menu-texture.webp'],
]);
const samplePhotos = new Set(['restaurant-ciolan.webp', 'restaurant-tochitura.webp']);
const previewAssets = new Set([
  'assets/pizza-hero-1280.webp', 'assets/pizza-hero-1920.webp', 'assets/pizza-hero-2560.webp',
  'assets/pizza-portrait-640.webp', 'assets/pizza-portrait-1200.webp',
  'assets/site/home-dining.webp', 'assets/site/casa-header-arrow.svg',
  'assets/site/home-footer-arrow.svg', 'assets/site/home-reserve-arrow.svg',
  'assets/site/home-story-arrow.svg', 'assets/site/pizza-hero-arrow.svg',
  'assets/site/pizza-seal.svg', 'assets/site/footer-pattern.svg',
]);
const cachedAssets = new Map();
const fontTypes = { '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
const types = {
  ...fontTypes,
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};
const bundledAssets = readdir(path.join(folder, 'assets', 'fonts')).then((fonts) => {
  for (const font of fonts) {
    if (Object.hasOwn(fontTypes, path.extname(font))) publicFiles.set(`/assets/fonts/${font}`, `assets/fonts/${font}`);
  }
});

function response(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: { 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store', ...headers },
    body,
  };
}

function readTestFile(file) {
  return fetch(`https://api.github.com/repos/iovmada/AVA/contents/${file}?ref=ava%2Fmenu-review-test`, {
    headers: { Accept: 'application/vnd.github.raw+json', 'User-Agent': 'AVA-Menu-Editor' },
    signal: AbortSignal.timeout(5_000),
    redirect: 'error',
  });
}

async function readTestPhoto(file, hash) {
  const photo = await readTestFile(`dist/assets/site/${file}`);
  if (!photo.ok) return;
  const bytes = Buffer.from(await photo.arrayBuffer());
  const limit = hash ? 155_000 : 400_000;
  if (bytes.length > limit || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') return;
  if (!hash || createHash('sha256').update(bytes).digest('hex') === hash) return bytes;
}

async function readPreviewAsset(file) {
  const cached = cachedAssets.get(file);
  if (cached && cached.expires > Date.now()) return cached.bytes;
  const asset = await fetch(`https://raw.githubusercontent.com/iovmada/AVA/refs/heads/ava/menu-review-test/dist/${file}`, {
    signal: AbortSignal.timeout(8_000), redirect: 'error',
  });
  if (!asset.ok) return;
  const bytes = Buffer.from(await asset.arrayBuffer());
  if (bytes.length > 400_000) return;
  cachedAssets.set(file, { bytes, expires: Date.now() + 300_000 });
  return bytes;
}

exports.main = async ({ http } = {}) => {
  if (process.env.AVA_MENU_REVIEW_MODE !== 'test') return response(404, 'Not found.');
  if (http?.method !== 'GET' && http?.method !== 'HEAD') return response(405, '', { Allow: 'GET, HEAD' });
  const resource = (http.path || '/').replace(/^.*\/menu\/editor(?=\/|$)/, '') || '/';
  if (resource === '/' || resource === '/admin') return response(302, '', { Location: editorUrl });
  if (resource === '/pizzeria') return response(302, '', { Location: pizzeriaUrl });
  if (resource === '/pizzeria/') {
    try {
      const menu = await readTestFile('site/menu.json');
      if (!menu.ok) throw new Error('Test menu unavailable');
      const { pizzeriaPreview } = await import('./pizzeria.mjs');
      const html = pizzeriaPreview(await menu.json());
      return response(200, http.method === 'HEAD' ? '' : html, { 'Content-Type': types['.html'] });
    } catch {
      return response(503, 'Meniul de test nu poate fi încărcat momentan.', { 'Content-Type': 'text/plain; charset=utf-8' });
    }
  }

  await bundledAssets;
  const file = publicFiles.get(resource);
  const newPhoto = resource.match(/^\/assets\/site\/(menu-([a-f0-9]{64})\.webp)$/);
  const samplePhoto = resource.startsWith('/assets/site/') && samplePhotos.has(path.basename(resource))
    && resource === `/assets/site/${path.basename(resource)}`;
  const previewAsset = previewAssets.has(resource.slice(1));
  try {
    const bytes = file ? await readFile(path.join(folder, file))
      : previewAsset ? await readPreviewAsset(resource.slice(1))
      : (newPhoto || samplePhoto) && await readTestPhoto(path.basename(resource), newPhoto?.[2]);
    if (!bytes) return response(404, 'Not found.');
    const type = types[path.extname(file || resource)];
    const cache = newPhoto ? 'public, max-age=31536000, immutable'
      : samplePhoto || previewAsset ? 'public, max-age=300' : 'no-store';
    const body = http.method === 'HEAD' ? '' : bytes.toString(type.startsWith('text/') ? 'utf8' : 'base64');
    return response(200, body, { 'Content-Type': type, 'Cache-Control': cache });
  } catch {
    return response(502, 'The preview asset is unavailable.');
  }
};
