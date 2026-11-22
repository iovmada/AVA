const { readFile, readdir } = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');

const folder = path.join(__dirname, 'public');
const editorUrl = '/api/menu/editor/admin/';
const publicFiles = new Map([
  ['/admin/', 'admin/index.html'],
  ['/admin/access.js', 'admin/access.js'],
  ['/admin/editor.js', 'admin/editor.js'],
  ['/admin/editor.css', 'admin/editor.css'],
  ['/styles.css', 'styles.css'],
  ['/assets/ava-logo.svg', 'assets/ava-logo.svg'],
  ['/assets/site/home-footer-logo.svg', 'assets/site/home-footer-logo.svg'],
  ['/assets/site/pizza-header-logo.svg', 'assets/site/pizza-header-logo.svg'],
]);
const fontTypes = { '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
const types = {
  ...fontTypes,
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};
const bundledAssets = Promise.all([
  readdir(path.join(folder, 'assets', 'fonts')),
  readdir(path.join(folder, 'assets', 'site')),
]).then(([fonts, images]) => {
  for (const font of fonts) {
    if (Object.hasOwn(fontTypes, path.extname(font))) publicFiles.set(`/assets/fonts/${font}`, `assets/fonts/${font}`);
  }
  for (const image of images) {
    if (image.endsWith('.webp')) publicFiles.set(`/assets/site/${image}`, `assets/site/${image}`);
  }
});

function response(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: { 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store', ...headers },
    body,
  };
}

async function readTestPhoto(file, hash) {
  const photo = await fetch(`https://api.github.com/repos/iovmada/AVA/contents/dist/assets/site/${file}?ref=ava%2Fmenu-review-test`, {
    headers: { Accept: 'application/vnd.github.raw+json', 'User-Agent': 'AVA-Menu-Editor' },
    signal: AbortSignal.timeout(5_000),
    redirect: 'error',
  });
  if (!photo.ok) return;
  const bytes = Buffer.from(await photo.arrayBuffer());
  if (bytes.length <= 155_000 && createHash('sha256').update(bytes).digest('hex') === hash) return bytes;
}

exports.main = async ({ http } = {}) => {
  if (process.env.AVA_MENU_REVIEW_MODE !== 'test') return response(404, 'Not found.');
  if (http?.method !== 'GET' && http?.method !== 'HEAD') return response(405, '', { Allow: 'GET, HEAD' });
  const resource = (http.path || '/').replace(/^.*\/menu\/editor(?=\/|$)/, '') || '/';
  if (resource === '/' || resource === '/admin') return response(302, '', { Location: editorUrl });

  await bundledAssets;
  const file = publicFiles.get(resource);
  const newPhoto = resource.match(/^\/assets\/site\/(menu-([a-f0-9]{64})\.webp)$/);
  try {
    const bytes = file ? await readFile(path.join(folder, file)) : newPhoto && await readTestPhoto(newPhoto[1], newPhoto[2]);
    if (!bytes) return response(404, 'Not found.');
    const type = types[path.extname(file || newPhoto[1])];
    const cache = newPhoto ? 'public, max-age=31536000, immutable' : 'no-store';
    const body = http.method === 'HEAD' ? '' : bytes.toString(type.startsWith('text/') ? 'utf8' : 'base64');
    return response(200, body, { 'Content-Type': type, 'Cache-Control': cache });
  } catch {
    return response(502, 'The preview asset is unavailable.');
  }
};
