import { layoutFor, menuPanel } from './shared.mjs';
import { dailyMenu, featured, pizzaMenu, restaurantMenu } from './menu.mjs';

const stories = {
  pizza: {
    href: 'pizzeria/', label: 'Pizzeria', title: 'Foc viu. Poftă bună.', image: 'pizza-hero.webp',
    description: 'Margini rumene, ingrediente bune și bucuria de a împărți. Pizza noastră are un secret simplu: nu grăbim nimic.',
  },
  restaurant: {
    href: 'restaurant/', label: 'Restaurant', title: 'Gust de acasă.', image: 'home-dining.webp',
    description: 'Bucate bănățene, rețete de familie și loc pentru toți ai tăi. Gustul acela pe care îl recunoști din prima.',
  },
  casa: { href: 'casa/', label: 'Casa', title: 'O noapte fără grabă.', image: 'home-room.webp' },
};

export function homePage() {
  const ui = layoutFor('home');
  const { photo, icon, button, base } = ui;
  const card = ({ href, title, caption, label, image, kind, soon }) => `<a class="entry-card entry-card--${kind}" href="${base}${href}">
    ${photo(image, '', 'entry-photo', kind === 'pizza')}
    <div class="entry-copy">
      ${soon ? '<p class="entry-soon">În curând</p>' : ''}
      <h2>${title}</h2>
      <p>${caption}</p>
      <div class="entry-link">${label}${icon('home-card-arrow.svg')}</div>
    </div>
  </a>`;

  return ui.document({
    title: 'AVA Brebu • Pizzerie, restaurant și cazare',
    description: 'AVA Brebu, locul în care se întâlnesc pizza din cuptor, bucatele bănățene și odihna fără grabă.',
    withHeader: false,
    content: `
      <section class="home-intro" aria-labelledby="home-title">
        <h1 class="sr-only" id="home-title">AVA Brebu</h1>
        <img class="home-brand" src="${ui.asset('home-masthead-logo.svg')}" alt="AVA Brebu" width="162" height="161">
        ${button('Rezervă o masă', '#contact', 'light-outline', 'home-reserve-arrow.svg')}
        <div class="entry-grid">
          ${card({ href: 'pizzeria/', title: 'Pizzeria', caption: 'Aluat bun. Foc viu. Încă o felie.', label: 'Descoperă pizzeria', image: 'home-pizza.webp', kind: 'pizza' })}
          ${card({ href: 'restaurant/', title: 'Restaurant', caption: 'Bucate bănățene. Oameni la masă.', label: 'Descoperă restaurantul', image: 'home-dining.webp', kind: 'restaurant' })}
          ${card({ href: 'casa/', title: 'Cazare', caption: 'Camere liniștite. Dimineți fără grabă.', label: 'Descoperă casa', image: 'home-room.webp', kind: 'stay', soon: true })}
        </div>
      </section>
      <section class="home-stories" aria-labelledby="home-stories-title">
        <div class="wrap">
          <h2 id="home-stories-title">Fă loc bucuriei.</h2>
          <div class="home-story-grid">
            <a class="home-story home-story--pizza" href="./pizzeria/">
              <div class="home-story-photo">${photo('home-pizza.webp', 'Pizza la cuptor, servită pe o masă de lemn')}</div>
              <div class="home-story-title"><h3>Foc viu.<br>Poftă bună.</h3>${icon('home-story-arrow.svg')}</div>
              <p>${stories.pizza.description}</p>
            </a>
            <a class="home-story home-story--dining" href="./restaurant/">
              <div class="home-story-photo">${photo('home-dining.webp', 'O masă pregătită în restaurantul AVA')}</div>
              <div class="home-story-title"><h3>Ca duminica,<br>în fiecare zi.</h3>${icon('home-story-arrow.svg')}</div>
              <p>${stories.restaurant.description}</p>
            </a>
          </div>
          ${photo('home-seal.svg', '', 'home-story-seal')}
        </div>
      </section>
      <section class="home-stay" aria-labelledby="home-stay-title">
        <div class="home-stay-copy">
          <p class="kicker">Cazare</p>
          <div>
            <h2 id="home-stay-title">Mai stai.<br>Îți prinde bine.</h2>
            <p>După o masă bună, vine o noapte liniștită. Camere calde, dimineți blânde și nicio grabă să pleci.</p>
          </div>
          <a class="line-link" href="./casa/">Găsește-ți camera ${icon('home-room-arrow.svg')}</a>
        </div>
        ${photo('home-room.webp', 'Cameră cu pat dublu, mobilier din lemn și lumină naturală', 'home-stay-photo')}
      </section>`,
  });
}

export function pizzaPage() {
  const ui = layoutFor('pizzeria');
  return ui.document({
    title: 'Pizzeria AVA • Din foc. Cu drag.',
    description: 'Descoperă pizzeria AVA din Brebu și meniul de pizza coaptă pe vatră.',
    content: `
      <section class="pizza-hero wrap" aria-labelledby="pizzeria-title">
        ${ui.photo('pizza-hero.webp', '', 'pizza-hero-photo', true)}
        <div class="pizza-hero-copy">
          <p class="kicker">Făină. Apă. Foc. Și un pic de suflet.</p>
          <h1 id="pizzeria-title">Din foc.<br><em>Cu drag.</em></h1>
          <p>Pizza coaptă pe vatră, cu lemn de fag.<br>Aluat răbdător, ingrediente bune și încă un motiv să strângi oamenii în jurul mesei.</p>
          <div class="actions">
            ${ui.button('Descoperă meniul', '#meniu', 'gold', 'pizza-hero-arrow.svg')}
            <a class="text-link" href="#contact">La pachet ↗</a>
          </div>
        </div>
      </section>
      <section class="action-band wrap">
        <div><p class="kicker">La noi sau la tine?</p><h2>Aceeași poftă bună.</h2><p>Rezervă o masă pentru ai tăi sau ia bucuria la pachet.</p></div>
        <div class="action-stack">
          ${ui.button('Rezervă o masă', '#contact', 'wine', 'home-reserve-arrow.svg')}
          ${ui.button('Comandă la pachet', '#contact', 'outline', 'casa-header-arrow.svg')}
        </div>
      </section>
      ${menuPanel(ui, {
        title: 'Ce-ți face poftă?', caption: 'Alege. Împarte. Mai ia o felie.',
        categories: ['Pizza', 'Paste', 'Salate', 'Deserturi', 'Băuturi'], items: pizzaMenu,
        texture: 'pizza-menu-texture.webp', tone: 'wine',
      })}
      ${ui.relatedSection('Mai rămâi puțin.', [
        { ...stories.restaurant, label: '', title: 'Restaurantul nostru' },
        { ...stories.casa, label: '', title: 'Cazare', image: 'home-dining.webp', description: stories.restaurant.description },
      ], { seal: 'pizza-seal.svg' })}`,
  });
}

function dailyPanel(ui) {
  return `<section class="daily-panel wrap" id="meniul-zilei" aria-labelledby="daily-title" style="--menu-texture: url('${ui.asset('restaurant-menu-texture.webp')}')">
    <header class="panel-head">
      <p class="kicker">Meniul zilei / O pauză cum se cuvine</p>
      <h2 id="daily-title">Prânzul are gust la meniul zilei</h2>
      <p>Luni – Vineri / 12:00 – 16:00</p>
    </header>
    <div class="daily-grid">
      ${dailyMenu.map(([price, soup, main, side], i) => `<article class="daily-card">
        <div class="daily-card-head"><h3 class="kicker">Varianta 0${i + 1}</h3><p class="dish-price">${price} <small>lei</small></p></div>
        <dl><dt>Felul întâi</dt><dd>${soup}</dd><dt>Felul principal</dt><dd>${main}</dd><dt>Alături</dt><dd>${side}</dd></dl>
        <p>Pâine de casă inclusă</p>
      </article>`).join('')}
    </div>
    <div class="daily-footer">
      <div><h3>Veniți mai mulți? Vă facem loc.</h3><p>Pentru grupuri și mese în familie, pregătim totul din timp.</p></div>
      ${ui.button('Contactează-ne', '#contact', 'cream', 'restaurant-daily-arrow.svg')}
    </div>
  </section>`;
}

export function restaurantPage() {
  const ui = layoutFor('restaurant');
  return ui.document({
    title: 'Restaurant AVA • Bucate bănățene la Brebu',
    description: 'Bucate bănățene, rețete de familie și loc pentru toți ai tăi la restaurantul AVA Brebu.',
    content: `
      <section class="restaurant-hero wrap" aria-labelledby="restaurant-title">
        <div>
          <h1 id="restaurant-title">Gustul care<br>ne aduce<br>împreună.</h1>
          <p>Rețete de familie, bucate făcute cu grijă și loc pentru toți ai tăi. La noi, o masă bună se întinde mereu la povești.</p>
          <div class="actions">
            ${ui.button('Vezi meniul zilei', '#meniul-zilei', 'green', 'restaurant-hero-arrow.svg')}
            <a class="text-link" href="#contact">Rezervă o masă ↗</a>
          </div>
        </div>
        ${ui.photo('restaurant-hero.webp', 'Bucate gătite la AVA, servite la masă', 'restaurant-hero-photo', true)}
      </section>
      ${dailyPanel(ui)}
      ${menuPanel(ui, {
        title: 'Din bucătăria noastră.', caption: 'À la carte / Rețete cu rost',
        categories: ['Feluri principale', 'Ciorbe', 'Garnituri', 'Deserturi', 'Băuturi'],
        items: restaurantMenu, featured, texture: 'restaurant-menu-texture.webp', tone: 'green',
      })}
      <section class="restaurant-story wrap">
        ${ui.photo('home-dining.webp', 'Sala restaurantului, cu lumină naturală și mese aranjate')}
        <div><p class="kicker">Lasă graba la ușă.</p><h2>Mai mult decât<br>o masă bună.</h2>
        <p>Un prânz între prieteni sau o duminică în familie. La Ava, ne plac mesele care adună oamenii și poveștile care mai cer încă o cafea. Așază-te. Ești de-al casei.</p></div>
      </section>
      <section class="action-band action-band--occasion wrap">
        ${ui.photo('restaurant-wordmark.svg', 'AVA', 'occasion-wordmark')}
        <div><p class="kicker">Ocazii mici. Mese frumoase.</p><h2>La masă, cu toți ai tăi.</h2><p>Pentru un prânz tihnit sau o întâlnire în familie, îți păstrăm un loc.</p></div>
        <div class="action-stack">
          ${ui.button('Rezervă o masă', '#contact', 'wine', 'home-reserve-arrow.svg')}
          <a class="text-link" href="#meniul-zilei">Meniul zilei, la pachet ↗</a>
        </div>
      </section>
      ${ui.relatedSection('Mai rămâi puțin.', [stories.pizza, stories.casa], { compact: true, subtitle: 'Descoperă și celelalte bucurii AVA' })}`,
  });
}

const rooms = [
  ['Camera dublă', '2 oaspeți · Pat matrimonial · 22 m²', 250, 'home-room.webp'],
  ['Camera twin', '2 oaspeți · Două paturi · 24 m²', 250, 'casa-twin.webp'],
  ['Camera de familie', '4 oaspeți · Două dormitoare · 38 m²', 390, 'casa-family.webp'],
];

const amenities = [
  ['wifi', 'Wi-Fi gratuit'],
  ['parking', 'Parcare privată'],
  ['air', 'Aer condiționat'],
  ['breakfast', 'Mic dejun la cerere'],
  ['food', 'Restaurant &amp; pizzerie'],
  ['landscape', 'Liniște și aer curat'],
];

function roomCard(ui, [name, description, price, image], first = false) {
  return `<article class="room-card${first ? ' room-card--first' : ''}">
    ${ui.photo(image, name, 'room-photo')}
    <div class="room-copy">
      ${first ? '<p class="kicker">Pentru voi doi</p>' : ''}
      <h3>${name}</h3><p class="room-details">${description}</p>
      <p>Baie privată, aer condiționat, Wi-Fi și tot confortul de care ai nevoie.</p>
      <div class="room-cta"><p class="room-price">${price} lei <small>/ noapte</small></p>
      ${ui.button('Întreabă de cameră', '#contact', 'wine', 'casa-room-arrow.svg')}</div>
    </div>
  </article>`;
}

export function casaPage() {
  const ui = layoutFor('casa');
  return ui.document({
    title: 'Casa AVA • Cazare în Brebu',
    description: 'Descoperă camerele Casei AVA din Brebu, Caraș-Severin.',
    content: `
      <section class="casa-hero wrap" aria-labelledby="casa-title">
        <div class="casa-hero-intro">
          <div><p class="kicker">AVA Casa / O pauză de la grabă</p><h1 id="casa-title">Mai stai puțin.</h1></div>
          <div><p>Camere calde, dimineți liniștite și timp pentru tine. Un loc în care să ajungi și să nu mai numeri orele.</p><a class="line-link" href="#camere">Găsește-ți camera ${ui.icon('casa-browse-arrow.svg')}</a></div>
        </div>
        ${ui.photo('home-room.webp', 'Pat dublu într-o cameră luminoasă a Casei AVA', 'casa-hero-photo', true)}
        <div class="casa-hero-caption"><p class="kicker">Confort simplu. Odihnă adevărată.</p><p>Rămâi pentru liniște. Revino de drag.</p></div>
      </section>
      <section class="rooms wrap" id="camere" aria-labelledby="rooms-title">
        <div class="section-split-head">
          <div><p class="kicker">Trei feluri de a te odihni</p><h2 id="rooms-title">Odihnă, în felul tău.</h2></div>
          <p>Alege camera. Lasă restul în grija noastră.</p>
        </div>
        ${roomCard(ui, rooms[0], true)}
        <div class="rooms-grid">${rooms.slice(1).map((room) => roomCard(ui, room)).join('')}</div>
      </section>
      <section class="stay-info wrap" aria-label="Informații pentru ședere" style="--menu-texture: url('${ui.asset('casa-info-texture.webp')}')">
        <div><h2>Tot ce contează.</h2>
          <ul class="amenities">${amenities.map(([icon, title]) => `<li>${ui.icon(`casa-${icon}.svg`)}${title}</li>`).join('')}</ul>
        </div>
        <div><h2>Înainte să vii.</h2>
          <dl class="stay-details">
            <div><dt>Check-in</dt><dd>de la 14:00</dd></div>
            <div><dt>Check-out</dt><dd>până la 11:00</dd></div>
            <div><dt>Rezervări</dt><dd>Direct, prin telefon sau mesaj</dd></div>
            <div><dt>Micul dejun</dt><dd>Disponibil la cerere</dd></div>
          </dl>
          <p>Tarife orientative pe cameră și pe noapte. Disponibilitatea se confirmă la rezervare.</p>
        </div>
      </section>
      <section class="action-band wrap">
        <div><p class="kicker">Un weekend sau încă o zi?</p><h2>Spune-ne când vii.</h2><p>Scrie-ne perioada și câți sunteți. Îți găsim camera potrivită și pregătim restul.</p></div>
        ${ui.button('Întreabă de disponibilitate', '#contact', 'wine', 'casa-ask-arrow.svg')}
      </section>
      ${ui.relatedSection('Și pofta e binevenită.', [stories.pizza, stories.restaurant], { compact: true, subtitle: 'O masă bună, la câțiva pași.' })}`,
  });
}
