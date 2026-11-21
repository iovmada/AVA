const directions = 'https://www.google.com/maps/search/?api=1&amp;query=Brebu%2C+Cara%C8%99-Severin%2C+Rom%C3%A2nia';
const destinations = [
  ['pizzeria/', 'Pizzeria'],
  ['restaurant/', 'Restaurant'],
  ['casa/', 'Casa'],
];

export function layoutFor(page) {
  const base = page === 'home' ? './' : '../';
  const asset = (file) => `${base}assets/site/${file}`;
  const icon = (file) => `<img class="icon" src="${asset(file)}" alt="" aria-hidden="true">`;
  const photo = (file, alt, classes = '', eager = false) =>
    `<img class="${classes}" src="${asset(file)}" alt="${alt}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

  function button(label, href, tone = 'wine', arrow) {
    return `<a class="pill pill--${tone}" href="${href}">${label}${arrow ? icon(arrow) : ''}</a>`;
  }

  function header() {
    const links = destinations.map(([path, label]) =>
      `<a href="${base}${path}"${path === `${page}/` ? ' aria-current="page"' : ''}>${label}</a>`).join('');
    const logo = page === 'casa'
      ? '<span class="nav-wordmark">ava</span><span class="kicker">/ CASA</span>'
      : `<img src="${asset(page === 'pizzeria' ? 'pizza-header-logo.svg' : 'restaurant-header-logo.svg')}" width="127" height="127" alt="">`;
    const reserve = page === 'casa'
      ? button('Întreabă de o cameră', '#contact', 'outline', 'casa-header-arrow.svg')
      : button('Rezervă', '#contact', page === 'restaurant' ? 'green' : 'wine', 'home-reserve-arrow.svg');
    return `<header class="page-header${page === 'casa' ? ' page-header--casa' : ''}">
      <div class="page-header-inner wrap">
        <nav class="page-nav" aria-label="Navigare principală">${links}</nav>
        <a class="page-brand" href="${base}" aria-label="AVA Brebu, acasă">${logo}</a>
        <div class="page-reserve">${reserve}</div>
      </div>
    </header>`;
  }

  function relatedCard({ href, label, title, image, description }, compact) {
    return `<a class="related-card ${compact ? 'related-card--compact' : ''}" href="${base}${href}">
      ${photo(image, '', 'related-photo')}
      <div>${label ? `<p class="kicker">${label}</p>` : ''}<h3>${title}</h3>
      ${description ? `<p class="related-description">${description}</p>` : ''}</div>
      ${icon('home-story-arrow.svg')}
    </a>`;
  }

  function relatedSection(title, cards, { compact = false, subtitle = '', seal = '' } = {}) {
    return `<section class="related wrap">
      <div class="related-head"><h2>${title}</h2>${subtitle ? `<p class="kicker">${subtitle}</p>` : ''}</div>
      <div class="related-grid${seal ? ' related-grid--seal' : ''}">
        ${relatedCard(cards[0], compact)}
        ${seal ? photo(seal, '', 'related-seal') : ''}
        ${relatedCard(cards[1], compact)}
      </div>
    </section>`;
  }

  function footer() {
    const casa = page === 'casa';
    const reservationNote = '<p class="footer-note">Detaliile de rezervare vor fi publicate aici.</p>';
    const arrow = '<span aria-hidden="true">↗</span>';
    return `<footer id="contact" class="site-footer ${casa ? 'site-footer--casa' : 'site-footer--patterned'}">
      <div class="wrap">
        ${casa ? '<p class="kicker">Suntem aici. Cu drag.</p>' : ''}
        <div class="footer-head">
          <h2>${casa ? 'Ne vedem la Ava.' : 'Hai să ne vedem.'}</h2>
          <a class="footer-direction" href="${directions}" aria-label="Găsește Brebu pe hartă">${icon(casa ? 'casa-footer-arrow.svg' : 'home-footer-arrow.svg')}</a>
        </div>
        <div class="footer-columns">
          <a class="footer-brand" href="${base}" aria-label="AVA Brebu, acasă">
            ${casa ? '<span class="nav-wordmark">ava</span><span class="kicker">Gust. Odihnă. Împreună.</span>' : photo('home-footer-logo.svg', '', 'footer-seal')}
          </a>
          <nav class="footer-links" aria-label="Explorează">
            <p class="kicker">Explorează</p>
            ${destinations.map(([path, label]) => `<a href="${base}${path}">${label}</a>`).join('')}
          </nav>
          <div class="footer-links">
            <p class="kicker">Planifică o vizită</p>
            ${casa ? '' : `<details class="footer-contact">
              <summary>Contact &amp; rezervări ${arrow}</summary>
              <div class="footer-contact-copy"><p>Brebu, Caraș-Severin</p>${reservationNote}</div>
            </details>`}
            <a href="${directions}">Cum ajungi la noi ${arrow}</a>
            <a href="${base}restaurant/#meniul-zilei">Meniul zilei${casa ? '' : ` ${arrow}`}</a>
          </div>
          ${casa ? `<div class="footer-links">
            <p class="kicker">Contact &amp; rezervări</p>
            <p>Brebu, Caraș-Severin</p>
            ${reservationNote}
          </div>` : `<div class="footer-links">
            <p class="kicker">Ținem legătura</p>
            <p>Instagram ${arrow}</p>
            <p>Facebook ${arrow}</p>
          </div>`}
        </div>
        <div class="footer-bottom">
          <p>© 2026 AVA</p>
          ${casa ? '' : '<p class="footer-legal">Confidențialitate Cookies ANPC</p>'}
        </div>
      </div>
    </footer>`;
  }

  function document({ title, description, content, withHeader = true }) {
    return `<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="${page === 'home' ? '#233f32' : '#f1eddf'}">
  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ro_RO">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <title>${title}</title>
  <link rel="icon" href="${base}assets/ava-logo.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${base}styles.css">
  ${page === 'pizzeria' || page === 'restaurant' ? `<script src="${base}site.js" defer></script>` : ''}
</head>
<body class="page-${page}">
  <a class="skip-link" href="#continut">Mergi la conținut</a>
  ${withHeader ? header() : ''}
  <main id="continut">${content}</main>
  ${footer()}
</body>
</html>
`;
  }

  return { base, asset, button, icon, photo, document, relatedSection };
}

export function menuItem([name, price, description, detail]) {
  return `<div class="dish-copy">
    <div class="dish-title"><h3>${name}</h3><p class="dish-price">${price} <small>lei</small></p></div>
    <p class="dish-description">${description}</p>
    <p class="dish-detail">${detail}</p>
  </div>`;
}

export function menuPanel(ui, { title, caption, categories, items, featured = [], texture, tone }) {
  return `<section id="meniu" class="menu-panel wrap menu-panel--${tone}" data-menu aria-labelledby="menu-title" style="--menu-texture: url('${ui.asset(texture)}')">
    <header class="panel-head">
      <p class="kicker">${caption}</p>
      <h2 id="menu-title">${title}</h2>
    </header>
    <div class="menu-filters" role="group" aria-label="Categorii de meniu">
      ${categories.map((label, i) => `<button type="button" data-menu-filter="${i}" aria-controls="menu-group-${i}" aria-pressed="${i === 0}">${label}</button>`).join('')}
    </div>
    <div id="menu-group-0" data-menu-group="0">
      ${featured.length ? `<p class="kicker menu-featured-label">Recomandările casei</p><div class="dish-grid dish-grid--featured">
        ${featured.map(({ item, photo, label }) => `<article class="featured-dish">
          <div class="featured-photo">${ui.photo(photo, item[0])}<span class="featured-label">${label}</span></div>
          ${menuItem(item)}
        </article>`).join('')}
      </div>` : ''}
      <div class="dish-grid">${items.map((item) => `<article class="dish">${menuItem(item)}</article>`).join('')}</div>
    </div>
    ${categories.slice(1).map((label, i) => `<div class="menu-empty" id="menu-group-${i + 1}" data-menu-group="${i + 1}" hidden>
      <h3>${label}</h3><p>Preparatele din această categorie vor fi adăugate în curând.</p>
    </div>`).join('')}
    <p class="menu-review-note">Meniu de prezentare. Produsele și prețurile se confirmă înainte de lansare.</p>
  </section>`;
}
