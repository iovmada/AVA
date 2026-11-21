import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import menuService from '../functions/packages/menu/propose/index.js';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 4173);
const adminApiPath = process.env.AVA_MENU_PROPOSAL_URL || '/api/menu/propose';
const localAdmin = menuService.createHandler(fetch, {
  AVA_MENU_SUBMIT_CODE: process.env.AVA_MENU_LOCAL_PASSWORD,
  AVA_MENU_ORIGIN: `http://127.0.0.1:${port}`,
}, () => readFile(new URL('../site/menu.json', import.meta.url)));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (path === adminApiPath) {
      let body = '';
      for await (const chunk of req.setEncoding('utf8')) {
        body += chunk;
        if (body.length > 950_000) {
          res.writeHead(413, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'Cererea este prea mare.' }));
          return;
        }
      }
      const result = await localAdmin({ http: { method: req.method, headers: req.headers, body } });
      res.writeHead(result.statusCode, result.headers).end(JSON.stringify(result.body));
      return;
    }
    const target = resolve(root, `.${path.endsWith('/') ? `${path}index.html` : path}`);
    if (!target.startsWith(root.endsWith(sep) ? root : root + sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    if (!(await stat(target)).isFile()) throw new Error('Not a file');
    const body = await readFile(target);
    res.writeHead(200, {
      'Content-Type': types[extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`AVA preview: http://127.0.0.1:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
