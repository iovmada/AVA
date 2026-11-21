const { createHash, createHmac, randomBytes, timingSafeEqual } = require('node:crypto');

const cookieName = '__Host-ava_menu';
const lifetime = 8 * 60 * 60;

const digest = (value) => createHash('sha256').update(value).digest();
const timestamp = () => Math.floor(Date.now() / 1000);

function correctPassword(password, secret) {
  return typeof password === 'string' && password.length <= 256 && timingSafeEqual(digest(password), digest(secret));
}

function sign(secret, session) {
  const key = createHmac('sha256', secret).update('ava-menu-session-v1').digest();
  return createHmac('sha256', key).update(session).digest('base64url');
}

function setCookie(value, maxAge) {
  return `${cookieName}=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

function startSession(secret) {
  const session = `${timestamp() + lifetime}.${randomBytes(24).toString('base64url')}`;
  return setCookie(`${session}.${sign(secret, session)}`, lifetime);
}

function endSession() {
  return setCookie('', 0);
}

function validSession(cookieHeader, secret) {
  if (typeof cookieHeader !== 'string') return false;
  const cookie = cookieHeader.split(';').map((piece) => piece.trim())
    .find((piece) => piece.startsWith(cookieName + '='));
  const fields = cookie?.slice(cookieName.length + 1).match(/^(\d{1,12})\.([A-Za-z0-9_-]{32})\.([A-Za-z0-9_-]{43})$/);
  if (!fields) return false;

  const [, expires, nonce, signature] = fields;
  const now = timestamp();
  return Number(expires) > now && Number(expires) <= now + lifetime
    && timingSafeEqual(Buffer.from(signature), Buffer.from(sign(secret, `${expires}.${nonce}`)));
}

module.exports = { correctPassword, startSession, endSession, validSession };
