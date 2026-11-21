const { items: menu, categories, menuVersion, proposalUrl } = JSON.parse(document.querySelector('#editor-data').textContent);
const sections = {
  pizzeria: { name: 'Pizzeria', title: 'Meniul pizzeriei', add: 'Adaugă preparat' },
  restaurant: { name: 'Restaurant', title: 'Meniul restaurantului', add: 'Adaugă preparat' },
  daily: { name: 'Meniul zilei', title: 'Meniul zilei', add: 'Adaugă variantă' },
};
const courseLabels = ['Felul întâi', 'Felul principal', 'Garnitură'];
const storageKey = `ava-menu-editor-draft-${menuVersion}`;

let saved = menu;
try {
  const local = JSON.parse(localStorage.getItem(storageKey));
  if (Array.isArray(local)) saved = local;
} catch {
  // The draft still works if the browser blocks or clears local storage.
}

let items = structuredClone(saved);
let section = 'pizzeria';
let editedItem;
let editedPhoto;
let readingPhoto = false;
const $ = (selector) => document.querySelector(selector);
const nav = $('.editor-nav');
const list = $('#item-list');
const search = $('#editor-search');
const filter = $('#category-filter');
const status = $('#editor-status');
const reviewButton = $('#review-changes');
const itemDialog = $('#item-dialog');
const reviewDialog = $('#review-dialog');
const itemForm = $('#item-form');
const proposalForm = $('#proposal-form');

const safe = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const normalized = (value) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const numberFormat = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 });
const amount = (value, unit) => `${numberFormat.format(value)} ${unit}`;

function changedItems() {
  const previous = new Map(menu.map((item) => [item.id, item]));
  return items.flatMap((item) => {
    const before = previous.get(item.id);
    return JSON.stringify(before) === JSON.stringify(item) ? [] : [{ item, before }];
  });
}

function updateStatus() {
  const count = changedItems().length;
  reviewButton.disabled = count === 0;
  status.textContent = count === 1 ? '1 modificare de verificat'
    : count > 1 ? `${count} modificări de verificat` : 'Ciorna se salvează în acest browser.';
}

function numberInput(item, field, unit, label) {
  const price = field === 'price';
  return `<label class="number-field">
    <input type="number" inputmode="${price ? 'decimal' : 'numeric'}" min="${price ? '0' : '1'}" step="${price ? '0.01' : '1'}" data-field="${field}" value="${safe(item[field])}" aria-label="${label} pentru ${safe(item.name)}" required>
    <span aria-hidden="true">${unit}</span>
  </label>`;
}

function itemRow(item) {
  const daily = item.section === 'daily';
  const subtitle = daily ? item.courses.map(([name]) => name).join(' · ') : item.description;
  return `<tr data-id="${safe(item.id)}">
    <td class="dish-cell">
      <div class="editor-dish">
        ${photoUrl(item.photo) ? `<img src="${safe(photoUrl(item.photo))}" alt="" width="44" height="44">` : ''}
        <div><strong>${safe(item.name)}</strong><p>${safe(subtitle)}</p></div>
      </div>
    </td>
    <td class="category-cell"><span class="category-tag">${daily ? 'Prânz' : safe(item.category)}</span></td>
    <td class="price-cell"><span class="mobile-field">Preț</span>${numberInput(item, 'price', 'lei', 'Preț în lei')}</td>
    <td class="weight-cell"><span class="mobile-field">${daily ? 'Porții' : 'Gramaj'}</span>${daily ? numberInput(item, 'servings', '', 'Număr de porții') : numberInput(item, 'weight', 'g', 'Gramaj în grame')}</td>
    <td class="visibility-cell">
      <button type="button" role="switch" aria-checked="${item.active}" aria-label="Vizibil în meniu: ${safe(item.name)}" class="visibility-button" data-action="toggle">
        <span class="switch-track" aria-hidden="true"></span><span data-visibility>${item.active ? 'Vizibil' : 'Ascuns'}</span>
      </button>
    </td>
    <td class="edit-cell">
      <button type="button" class="edit-button" aria-label="Editează ${safe(item.name)}" title="Editează preparatul" data-action="edit">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 6 4 4M5 19l1-5L16.5 3.5l4 4L10 18l-5 1Z"/></svg>
      </button>
    </td>
  </tr>`;
}

function renderList() {
  const query = normalized(search.value.trim());
  const visible = items.filter((item) => item.section === section
    && (!filter.value || item.category === filter.value)
    && normalized([item.name, item.description, item.courses?.flat().join(' ')].join(' ')).includes(query));

  list.innerHTML = visible.length ? `<table>
    <thead><tr><th scope="col">Preparat</th><th scope="col">Categorie</th><th scope="col">Preț</th><th scope="col">${section === 'daily' ? 'Porții' : 'Gramaj'}</th><th scope="col">Vizibilitate</th><th scope="col"><span class="sr-only">Acțiuni</span></th></tr></thead>
    <tbody>${visible.map(itemRow).join('')}</tbody>
  </table>` : '<p class="empty-list">Nu am găsit preparate. Schimbă căutarea sau categoria.</p>';

  const noun = section === 'daily' ? ['variantă', 'variante'] : ['preparat', 'preparate'];
  $('#editor-count').textContent = `${visible.length} ${noun[visible.length === 1 ? 0 : 1]}`;
}

function showSection(next) {
  section = next;
  for (const button of nav.querySelectorAll('button')) {
    if (button.dataset.section === section) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
  const details = sections[section];
  $('#editor-section').textContent = details.name;
  $('#editor-title').textContent = details.title;
  $('#editor-description').textContent = section === 'daily'
    ? 'Editează prețul, porțiile și felurile incluse în fiecare variantă.'
    : 'Editează prețurile și gramajele direct din listă.';
  $('#add-item').lastChild.textContent = ` ${details.add}`;
  filter.innerHTML = '<option value="">Toate categoriile</option>'
    + categories[section].map((category) => `<option>${category}</option>`).join('');
  filter.parentElement.hidden = section === 'daily';
  search.value = '';
  renderList();
}

function field(name, label, value, type = 'text', step = '1') {
  const measurement = type === 'number' ? `min="${name === 'price' ? '0' : '1'}" step="${step}" inputmode="${step === '1' ? 'numeric' : 'decimal'}"` : 'maxlength="160"';
  return `<label>${label}<input type="${type}" name="${name}" value="${safe(value)}" ${measurement} required></label>`;
}

function openItem(item) {
  editedItem = item;
  editedPhoto = item?.photo;
  const daily = section === 'daily';
  const creating = !item;
  $('#item-dialog-title').textContent = creating ? sections[section].add : daily ? 'Editează varianta' : 'Editează preparatul';
  const generalInputs = `${field('name', daily ? 'Numele variantei' : 'Denumire', item?.name)}
    ${field('price', 'Preț (lei)', item?.price, 'number', '0.01')}`;
  const details = daily
    ? `${field('servings', 'Număr de porții', item?.servings ?? 1, 'number')}
       ${field('breadWeight', 'Pâine inclusă (g)', item?.breadWeight ?? 50, 'number')}
       ${courseLabels.map((label, index) => `${field(`course-${index}`, label, item?.courses[index][0])}
         ${field(`weight-${index}`, `${label} (g)`, item?.courses[index][1], 'number')}`).join('')}`
    : `${field('weight', 'Gramaj (g)', item?.weight, 'number')}
       <label>Categorie<select name="category">${categories[section].map((category) =>
         `<option${category === (item?.category ?? filter.value) ? ' selected' : ''}>${category}</option>`).join('')}</select></label>
       <label class="field-wide">Descriere<textarea name="description" rows="3" maxlength="420">${safe(item?.description)}</textarea></label>`;
  $('#item-fields').innerHTML = generalInputs + details + (section === 'restaurant' ? `
    <div class="field-wide editor-photo-field">
      <img id="dish-preview" alt="Fotografia preparatului" width="112" height="78" hidden>
      <div>
        <label>Fotografie <input id="dish-photo" type="file" accept="image/jpeg,image/png,image/webp"></label>
        <button id="remove-photo" class="editor-button editor-button--outline" type="button" hidden>Elimină fotografia</button>
        <p id="photo-status" role="status">JPG, PNG sau WebP</p>
      </div>
    </div>` : '');
  showPhoto();
  itemForm.querySelector('[type="submit"]').textContent = creating ? sections[section].add : 'Aplică modificările';
  itemDialog.showModal();
  itemForm.elements.namedItem('name').focus();
}

function photoUrl(photo) {
  if (!photo) return '';
  if (photo.startsWith('data:image/webp;base64,')) return photo;
  return /^[a-z0-9-]+\.webp$/.test(photo) ? `../assets/site/${photo}` : '';
}

function showPhoto() {
  const preview = $('#dish-preview');
  if (!preview) return;
  const url = photoUrl(editedPhoto);
  if (url) preview.src = url;
  else preview.removeAttribute('src');
  preview.hidden = !url;
  $('#remove-photo').hidden = !url;
}

async function optimizePhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 12 * 1024 * 1024) {
    throw new Error('Alege un fișier JPG, PNG sau WebP de până la 12 MB.');
  }
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    for (const limit of [1100, 900, 720, 560, 420]) {
      const factor = Math.min(1, limit / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * factor));
      canvas.height = Math.max(1, Math.round(bitmap.height * factor));
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const result = canvas.toDataURL('image/webp', .78);
      if (result.startsWith('data:image/webp;base64,') && result.length <= 202_000) return result;
    }
    throw new Error('Fotografia nu a putut fi comprimată. Încearcă un fișier mai mic.');
  } finally {
    bitmap.close();
  }
}

function describeChange(item, before) {
  if (!before) return `Preparat nou · ${amount(item.price, 'lei')}${item.photo ? ' · Fotografie nouă' : ''}`;
  const differences = [];
  if (before.price !== item.price) differences.push(`Preț: ${amount(before.price, 'lei')} → ${amount(item.price, 'lei')}`);
  if (before.weight !== item.weight) differences.push(`Gramaj: ${amount(before.weight, 'g')} → ${amount(item.weight, 'g')}`);
  if (before.servings !== item.servings) differences.push(`Porții: ${before.servings} → ${item.servings}`);
  if (before.name !== item.name) differences.push(`Denumire: ${before.name} → ${item.name}`);
  if (before.category !== item.category) differences.push(`Categorie: ${before.category} → ${item.category}`);
  if (before.description !== item.description) differences.push('Descriere actualizată');
  if (before.photo !== item.photo) differences.push(item.photo ? 'Fotografie actualizată' : 'Fotografie eliminată');
  if (before.breadWeight !== item.breadWeight) differences.push(`Pâine: ${amount(before.breadWeight, 'g')} → ${amount(item.breadWeight, 'g')}`);
  if (JSON.stringify(before.courses) !== JSON.stringify(item.courses)) differences.push('Feluri de mâncare actualizate');
  if (before.active !== item.active) differences.push(item.active ? 'Vizibil în meniu' : 'Ascuns din meniu');
  return differences.join(' · ');
}

nav.addEventListener('click', (event) => {
  const button = event.target.closest('[data-section]');
  if (button) showSection(button.dataset.section);
});
search.addEventListener('input', renderList);
filter.addEventListener('change', renderList);

list.addEventListener('input', (event) => {
  const input = event.target;
  if (!input.matches('input[data-field]') || !input.validity.valid) return;
  const item = items.find(({ id }) => id === input.closest('tr').dataset.id);
  item[input.dataset.field] = input.valueAsNumber;
  updateStatus();
});

list.addEventListener('change', (event) => {
  const input = event.target;
  if (!input.matches('input[data-field]')) return;
  const item = items.find(({ id }) => id === input.closest('tr').dataset.id);
  if (input.reportValidity()) item[input.dataset.field] = input.valueAsNumber;
  else input.value = item[input.dataset.field];
  updateStatus();
});

list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const item = items.find(({ id }) => id === button.closest('tr').dataset.id);
  if (button.dataset.action === 'edit') {
    openItem(item);
    return;
  }
  item.active = !item.active;
  button.setAttribute('aria-checked', item.active);
  button.querySelector('[data-visibility]').textContent = item.active ? 'Vizibil' : 'Ascuns';
  updateStatus();
});

$('#add-item').addEventListener('click', () => openItem());
itemForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (readingPhoto) return;
  const values = new FormData(itemForm);
  const value = (name) => values.get(name).trim();
  const numeric = (name) => Number(value(name));
  const name = value('name');
  if (!name) {
    itemForm.elements.name.setCustomValidity('Introdu o denumire.');
    itemForm.elements.name.reportValidity();
    return;
  }
  const item = editedItem ?? { id: crypto.randomUUID(), section, active: true };
  Object.assign(item, { name, price: numeric('price') });
  if (section === 'daily') {
    Object.assign(item, {
      servings: numeric('servings'), breadWeight: numeric('breadWeight'),
      courses: courseLabels.map((_, index) => [value(`course-${index}`), numeric(`weight-${index}`)]),
    });
  } else {
    Object.assign(item, { category: value('category'), description: value('description'), weight: numeric('weight') });
    if (editedPhoto) item.photo = editedPhoto;
    else delete item.photo;
  }
  if (!editedItem) {
    items.unshift(item);
    search.value = '';
    filter.value = '';
  }
  itemDialog.close();
  renderList();
  updateStatus();
});

itemForm.addEventListener('change', async (event) => {
  if (event.target.id !== 'dish-photo' || !event.target.files[0]) return;
  const input = event.target;
  const submit = itemForm.querySelector('[type="submit"]');
  readingPhoto = true;
  input.disabled = submit.disabled = true;
  $('#photo-status').textContent = 'Se pregătește fotografia…';
  try {
    const photo = await optimizePhoto(input.files[0]);
    if (!input.isConnected || !itemDialog.open) return;
    editedPhoto = photo;
    showPhoto();
    $('#photo-status').textContent = 'Fotografie pregătită.';
  } catch (error) {
    if (input.isConnected) {
      $('#photo-status').textContent = error instanceof DOMException ? 'Imaginea nu a putut fi deschisă.' : error.message;
    }
  } finally {
    if (input.isConnected) input.disabled = submit.disabled = false;
    readingPhoto = false;
  }
});

itemForm.addEventListener('click', (event) => {
  if (event.target.id !== 'remove-photo' || readingPhoto) return;
  editedPhoto = undefined;
  $('#dish-photo').value = '';
  $('#photo-status').textContent = 'Fotografie eliminată.';
  showPhoto();
  $('#dish-photo').focus();
});

itemForm.addEventListener('input', (event) => {
  if (event.target.name === 'name') event.target.setCustomValidity('');
});

document.querySelectorAll('[data-close]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog').close());
});

reviewButton.addEventListener('click', () => {
  $('#review-list').innerHTML = changedItems().map(({ item, before }) =>
    `<li><strong>${safe(item.name)}</strong><p>${safe(sections[item.section].name)} · ${safe(describeChange(item, before))}</p></li>`).join('');
  reviewDialog.showModal();
});

$('#save-draft').addEventListener('click', () => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
    reviewDialog.close();
    updateStatus();
    status.textContent = 'Ciorna a fost salvată pe acest dispozitiv.';
  } catch {
    reviewDialog.close();
    status.textContent = 'Browserul nu a putut salva ciorna. Modificările sunt încă deschise.';
  }
});

if (proposalForm) {
  const button = $('#submit-proposal');
  const feedback = $('#proposal-status');
  const link = $('#proposal-link');
  button.addEventListener('click', () => {
    proposalForm.hidden = false;
    proposalForm.elements.namedItem('code').focus();
  });
  reviewDialog.addEventListener('close', () => {
    proposalForm.reset();
    proposalForm.hidden = true;
    feedback.textContent = '';
    link.hidden = true;
  });
  proposalForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = proposalForm.querySelector('[type="submit"]');
    const password = proposalForm.elements.namedItem('code');
    submit.disabled = true;
    feedback.textContent = 'Se trimite propunerea…';
    link.hidden = true;
    try {
      const response = await fetch(proposalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password.value}` },
        body: JSON.stringify({ version: menuVersion, items }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Propunerea nu a putut fi trimisă.');
      if (!/^https:\/\/github\.com\/iovmada\/AVA\/pull\/\d+$/.test(result.url)) throw new Error('Linkul propunerii nu este valid.');
      link.href = result.url;
      link.hidden = false;
      feedback.textContent = 'Propunerea așteaptă aprobarea pe GitHub.';
      password.value = '';
    } catch (error) {
      feedback.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  });
}

showSection(section);
