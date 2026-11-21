const { createHash, createSign, timingSafeEqual } = require('node:crypto');
const { hash, MenuError, validateProposal } = require('./menu-data.js');

const repository = 'iovmada/AVA';
const base = 'main';
const menuPath = 'site/menu.json';
const assetPath = 'dist/assets/site/';
const origin = 'https://api.github.com';

function jwt(appId, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const payload = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ iat: now - 30, exp: now + 540, iss: appId })}`;
  return `${payload}.${createSign('RSA-SHA256').update(payload).sign(privateKey).toString('base64url')}`;
}

function credentialsMatch(header, code) {
  const digest = (value) => createHash('sha256').update(value).digest();
  return typeof header === 'string' && timingSafeEqual(digest(header), digest(`Bearer ${code}`));
}

function json(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, body };
}

class GithubError extends Error {
  constructor(status) {
    super('GitHub rejected the request.');
    this.status = status;
  }
}

function githubClient(send, token, prefix = '') {
  return async (path, body) => {
    const response = await send(`${origin}${prefix}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json', 'User-Agent': 'AVA-Menu-Editor', 'X-GitHub-Api-Version': '2022-11-28',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: 'error',
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new GithubError(response.status);
    return response.json();
  };
}

async function propose(api, payload) {
  if (!payload || typeof payload.version !== 'string' || !/^[a-f0-9]{64}$/.test(payload.version)) {
    throw new MenuError(400, 'Versiunea meniului nu este validă.');
  }

  const { object: { sha: parent } } = await api(`/git/ref/heads/${base}`);
  const rules = await api(`/rules/branches/${base}`);
  const requiredReview = rules.some(({ type, parameters }) => type === 'pull_request'
    && parameters.required_approving_review_count >= 1
    && parameters.require_code_owner_review
    && parameters.dismiss_stale_reviews_on_push);
  if (!requiredReview) throw new MenuError(503, 'Ramura de producție trebuie să aibă aprobarea obligatorie activată.');
  const ownersFile = await api(`/contents/.github/CODEOWNERS?ref=${parent}`);
  const owners = Buffer.from(ownersFile.content, 'base64').toString().split(/\r?\n/)
    .map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));
  if (owners.join('\n') !== '* @iovmada\n/.github/CODEOWNERS @iovmada') {
    throw new MenuError(503, 'Aprobarea meniului trebuie să îi fie atribuită contului @iovmada.');
  }
  const menuFile = await api(`/contents/${menuPath}?ref=${parent}`);
  const currentData = Buffer.from(menuFile.content, 'base64');
  if (hash(currentData) !== payload.version) {
    throw new MenuError(409, 'Meniul public a fost actualizat. Deschide ultima versiune a editorului înainte de trimitere.');
  }

  const current = JSON.parse(currentData);
  const { items, photos } = validateProposal(payload.items, current);
  const content = JSON.stringify(items, null, 2) + '\n';
  if (content === currentData.toString()) throw new MenuError(400, 'Nu există modificări de trimis.');

  // Identical retries reuse the same branch and pull request.
  const branch = `ava/menu-${hash(parent + content).slice(0, 24)}`;
  const findRequest = async () => {
    const [prior] = await api(`/pulls?state=all&head=${encodeURIComponent('iovmada:' + branch)}&base=${base}`);
    if (!prior) return null;
    if (prior.state === 'open') return prior.html_url;
    throw new MenuError(409, 'Această propunere a fost deja închisă. Verifică istoricul de pe GitHub.');
  };

  const existing = await findRequest();
  if (existing) return existing;

  const { tree } = await api(`/git/commits/${parent}`);
  const changedFiles = [{ path: menuPath, mode: '100644', type: 'blob', content }];
  for (const [name, bytes] of photos) {
    const { sha } = await api('/git/blobs', { content: bytes.toString('base64'), encoding: 'base64' });
    changedFiles.push({ path: assetPath + name, mode: '100644', type: 'blob', sha });
  }
  const next = await api('/git/trees', { base_tree: tree.sha, tree: changedFiles });
  const commit = await api('/git/commits', { message: 'Propose AVA menu update', tree: next.sha, parents: [parent] });
  try {
    await api('/git/refs', { ref: `refs/heads/${branch}`, sha: commit.sha });
  } catch (error) {
    if (!(error instanceof GithubError) || error.status !== 422) throw error;
    const ref = await api(`/git/ref/heads/${branch}`);
    const previous = await api(`/git/commits/${ref.object.sha}`);
    if (previous.tree.sha !== next.sha) throw new MenuError(409, 'Propunerea existentă are alt conținut.');
  }

  try {
    const request = await api('/pulls', {
      title: 'Propunere de actualizare a meniului AVA',
      head: branch, base,
      body: '@iovmada, verifică prețurile, preparatele și fotografiile în **Files changed**. Meniul se publică după aprobare și îmbinare în ramura de producție.',
    });
    return request.html_url;
  } catch (error) {
    if (!(error instanceof GithubError) || error.status !== 422) throw error;
    const prior = await findRequest();
    if (prior) return prior;
    throw error;
  }
}

function createHandler(send = fetch, env = process.env) {
  return async ({ http } = {}) => {
    if (http?.method?.toUpperCase() !== 'POST') return json(405, { error: 'Metodă indisponibilă.' });
    const code = env.AVA_MENU_SUBMIT_CODE;
    const appId = env.AVA_GITHUB_APP_ID;
    const installationId = env.AVA_GITHUB_INSTALLATION_ID;
    const key = env.AVA_GITHUB_PRIVATE_KEY;
    if (!code || code.length < 16 || !appId || !/^\d+$/.test(installationId) || !key) {
      return json(503, { error: 'Trimiterea spre aprobare nu a fost configurată.' });
    }
    if (!credentialsMatch(http.headers?.authorization, code)) {
      return json(401, { error: 'Codul de trimitere este incorect.' });
    }
    const body = String(http.body ?? '');
    if (body.length > 1_300_000) return json(413, { error: 'Trimite mai puține fotografii într-o singură propunere.' });

    let payload;
    try {
      const decoded = Buffer.from(body, http.isBase64Encoded ? 'base64' : 'utf8');
      if (decoded.length > 950_000) return json(413, { error: 'Trimite mai puține fotografii într-o singură propunere.' });
      payload = JSON.parse(decoded.toString());
    } catch {
      return json(400, { error: 'Datele propunerii nu au un format valid.' });
    }

    try {
      const privateKey = key.includes('BEGIN') ? key.replaceAll('\\n', '\n') : Buffer.from(key, 'base64').toString();
      const app = githubClient(send, jwt(appId, privateKey));
      const { token } = await app(`/app/installations/${installationId}/access_tokens`, {
        repositories: ['AVA'], permissions: { contents: 'write', pull_requests: 'write' },
      });
      const api = githubClient(send, token, `/repos/${repository}`);
      const url = await propose(api, payload);
      return json(200, { url });
    } catch (error) {
      if (error instanceof MenuError) return json(error.status, { error: error.message });
      return json(502, { error: 'GitHub nu a putut primi propunerea. Încearcă din nou.' });
    }
  };
}

exports.main = createHandler();
exports.createHandler = createHandler;
