import { stories } from './stories.mjs';
import { layoutFor, menuPanel } from './shared.mjs';

export function pizzaPage(menu, categories) {
  const ui = layoutFor('pizzeria');
  return ui.document({
    title: 'Pizzeria AVA • Din foc. Cu drag.',
    description: 'Descoperă pizzeria AVA din Brebu și meniul de pizza coaptă pe vatră.',
    content: `
      <section class="pizza-hero wrap" aria-labelledby="pizzeria-title">
        <picture>
          <source media="(max-width: 730px)"
            srcset="${ui.base}assets/pizza-portrait-640.webp 640w, ${ui.base}assets/pizza-portrait-1200.webp 1200w"
            sizes="(max-width: 425px) 390px, 92vw">
          <img class="pizza-hero-photo" src="${ui.base}assets/pizza-hero-1920.webp"
            srcset="${ui.base}assets/pizza-hero-1280.webp 1280w, ${ui.base}assets/pizza-hero-1920.webp 1920w, ${ui.base}assets/pizza-hero-2560.webp 2560w"
            sizes="(min-width: 1440px) 1312px, 92vw" alt="" fetchpriority="high" decoding="async">
        </picture>
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
        categories: categories.pizzeria, items: menu.filter(({ section, active }) => section === 'pizzeria' && active),
        texture: 'pizza-menu-texture.webp', tone: 'wine',
      })}
      ${ui.relatedSection('Mai rămâi puțin.', [
        { ...stories.restaurant, label: '', title: 'Restaurantul nostru' },
        { ...stories.casa, label: '', title: 'Cazare', image: 'home-dining.webp', description: stories.restaurant.description },
      ], { seal: 'pizza-seal.svg' })}`,
  });
}
