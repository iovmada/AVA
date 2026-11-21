const state = document.querySelector('#editor-data');
const { proposalUrl } = JSON.parse(state.textContent);
const form = document.querySelector('#editor-login');
const feedback = document.querySelector('#access-status');
const password = document.querySelector('#editor-password');
const submit = form.querySelector('button');

function openEditor(menu) {
  const template = document.querySelector('#editor-template');
  state.textContent = JSON.stringify({ ...menu, proposalUrl });
  document.body.className = 'menu-editor';
  document.body.replaceChildren(template.content.cloneNode(true), state);
  return import('./editor.js');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submit.disabled = true;
  feedback.textContent = 'Se verifică parola…';
  try {
    const response = await fetch(proposalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', password: password.value }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Autentificarea nu este disponibilă.');
    await openEditor(result);
  } catch (error) {
    feedback.textContent = error instanceof SyntaxError ? 'Autentificarea nu este disponibilă.' : error.message;
    password.focus();
    password.select();
  } finally {
    submit.disabled = false;
  }
});

fetch(proposalUrl, { cache: 'no-store' })
  .then((response) => response.ok ? response.json() : null)
  .then((result) => {
    if (result && !submit.disabled) return openEditor(result);
  })
  .catch(() => {});
