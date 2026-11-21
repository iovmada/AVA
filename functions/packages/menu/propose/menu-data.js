const { createHash } = require('node:crypto');

const categories = {
  pizzeria: ['Pizza', 'Paste', 'Salate', 'Deserturi', 'Băuturi'],
  restaurant: ['Feluri principale', 'Ciorbe', 'Garnituri', 'Deserturi', 'Băuturi'],
  daily: [],
};

const hash = (value) => createHash('sha256').update(value).digest('hex');

class MenuError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function requireValue(condition, message) {
  if (!condition) throw new MenuError(400, message);
}

function photoFile(photo, photos) {
  const prefix = 'data:image/webp;base64,';
  requireValue(typeof photo === 'string' && photo.startsWith(prefix) && photo.length <= 202_000,
    'Fotografia trebuie să fie un fișier WebP pregătit de editor.');
  const bytes = Buffer.from(photo.slice(prefix.length), 'base64');
  requireValue(photo === prefix + bytes.toString('base64')
    && bytes.length >= 20
    && bytes.toString('ascii', 0, 4) === 'RIFF'
    && bytes.readUInt32LE(4) === bytes.length - 8
    && bytes.toString('ascii', 8, 12) === 'WEBP'
    && ['VP8 ', 'VP8L', 'VP8X'].includes(bytes.toString('ascii', 12, 16)),
  'Fotografia nu este un WebP valid.');
  const filename = `menu-${hash(bytes)}.webp`;
  photos.set(filename, bytes);
  return filename;
}

function text(value, label, limit, optional = false) {
  requireValue(typeof value === 'string' && value.length <= limit
    && (optional || value.trim().length > 0) && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value),
  `${label} lipsește sau are un format invalid.`);
  return value.trim();
}

function weight(value) {
  requireValue(Number.isInteger(value) && value > 0 && value <= 100_000, 'Verifică gramajele.');
  return value;
}

function validateProposal(input, current) {
  requireValue(Array.isArray(input) && input.length >= current.length && input.length <= 250, 'Lista nu are un format valid.');
  const remaining = new Map(current.map((item) => [item.id, item]));
  const seen = new Set();
  const photos = new Map();

  const items = input.map((raw) => {
    requireValue(raw && typeof raw === 'object' && typeof raw.id === 'string'
      && /^(?:(?:pizzeria|restaurant|daily)-\d+|[a-f0-9-]{36})$/.test(raw.id) && !seen.has(raw.id), 'Un preparat are un identificator invalid sau duplicat.');
    requireValue(Object.hasOwn(categories, raw.section) && typeof raw.active === 'boolean', 'Un preparat are o secțiune sau vizibilitate invalidă.');
    const before = remaining.get(raw.id);
    requireValue(!before || raw.section === before.section, 'Un preparat existent trebuie să rămână în secțiunea lui.');
    seen.add(raw.id);
    remaining.delete(raw.id);
    const name = text(raw.name, 'Denumirea', 160);
    requireValue(Number.isFinite(raw.price) && raw.price >= 0 && raw.price <= 100_000
      && Math.abs(raw.price * 100 - Math.round(raw.price * 100)) < .000001, 'Verifică prețurile. Folosește cel mult două zecimale.');

    if (raw.section === 'daily') {
      requireValue(Number.isInteger(raw.servings) && raw.servings > 0 && raw.servings <= 100, 'Verifică numărul de porții.');
      requireValue(Array.isArray(raw.courses) && raw.courses.length === 3, 'O variantă trebuie să aibă trei feluri.');
      const courses = raw.courses.map((course) => {
        requireValue(Array.isArray(course) && course.length === 2, 'Verifică felurile din meniul zilei.');
        return [text(course[0], 'Denumirea felului', 160), weight(course[1])];
      });
      return {
        id: raw.id, section: raw.section, name, active: raw.active, price: raw.price, servings: raw.servings,
        breadWeight: weight(raw.breadWeight), courses,
      };
    }

    requireValue(categories[raw.section].includes(raw.category), 'Un preparat are o categorie invalidă.');
    const item = {
      id: raw.id, section: raw.section, name, price: raw.price,
      description: text(raw.description, 'Descrierea', 420, true),
      weight: weight(raw.weight), category: raw.category, active: raw.active,
    };
    if (before?.note) item.note = before.note;
    if (raw.section === 'restaurant' && raw.photo) {
      item.photo = before?.photo === raw.photo && /^[a-z0-9-]+\.webp$/.test(raw.photo) ? before.photo : photoFile(raw.photo, photos);
      if (before?.label) item.label = before.label;
    }
    return item;
  });

  requireValue(remaining.size === 0, 'Ascunde preparatele existente din listă în loc să le ștergi.');
  return { items, photos };
}

module.exports = { categories, hash, MenuError, validateProposal };
