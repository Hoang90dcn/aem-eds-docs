import { el, formatPrice } from './utils.js';
import createAccordion from './accordion.js';
import { AVAILABILITY_RESET } from './state.js';

const COPY_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
`;

const GIFT_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <rect x="3" y="9" width="18" height="12" rx="1.5" />
    <path d="M3 13h18M12 9v12" />
    <path d="M12 9S10.5 3 8 3a2.5 2.5 0 0 0 0 5m4 1s1.5-6 4-6a2.5 2.5 0 0 1 0 5" />
  </svg>
`;

const VISIBLE_FEATURES = 3;

function createStars(rating) {
  const stars = el('span', 'pd-stars');

  stars.setAttribute('aria-hidden', 'true');

  for (let index = 0; index < 5; index += 1) {
    const star = el('span', 'pd-star', '★');

    if (index < Math.round(rating)) star.classList.add('is-filled');

    stars.append(star);
  }

  return stars;
}

function createSkuRow(product) {
  const row = el('p', 'pd-sku');

  row.append(el('span', 'pd-sku-value', product.sku));

  const copy = el('button', 'pd-sku-copy');

  copy.type = 'button';
  copy.innerHTML = COPY_ICON;
  copy.setAttribute('aria-label', `Copy model number ${product.sku}`);

  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(product.sku);

      copy.classList.add('is-copied');

      setTimeout(() => copy.classList.remove('is-copied'), 1500);
    } catch (error) {
      /* clipboard blocked, nothing useful to fall back to */
    }
  });

  row.append(copy);

  return row;
}

function createRatingRow(product) {
  const row = el('div', 'pd-rating');

  row.append(createStars(product.rating));

  const count = product.reviewCount === 1 ? '1 Review' : `${product.reviewCount} Reviews`;

  row.append(el('span', 'pd-rating-count', count));

  const prompt = el('button', 'pd-rating-prompt', 'SHARE YOUR THOUGHTS!');

  prompt.type = 'button';

  row.append(prompt);

  return row;
}

function createPromo(promo) {
  if (promo.type === 'highlight') {
    const banner = el('a', 'pd-promo pd-promo-highlight');

    banner.href = promo.href || '#';
    banner.append(el('span', null, promo.text));
    banner.append(el('span', 'pd-promo-chevron', '›'));

    return banner;
  }

  const box = el('div', 'pd-promo pd-promo-gift');

  const icon = el('span', 'pd-promo-icon');

  icon.innerHTML = GIFT_ICON;

  box.append(icon);
  box.append(el('span', 'pd-promo-text', promo.text));

  if (promo.linkText) {
    const link = el('a', 'pd-promo-link');

    link.href = promo.href || '#';
    link.textContent = `${promo.linkText} ›`;

    box.append(link);
  }

  return box;
}

function createKeyFeatures(product) {
  const { section, body } = createAccordion('Key Features');

  const list = el('ul', 'pd-features');

  const items = product.keyFeatures.map((feature, index) => {
    const item = el('li', null, feature);

    if (index >= VISIBLE_FEATURES) item.hidden = true;

    list.append(item);

    return item;
  });

  body.append(list);

  const footer = el('div', 'pd-features-footer');

  if (items.length > VISIBLE_FEATURES) {
    const more = el('button', 'pd-features-more');

    more.type = 'button';
    more.setAttribute('aria-expanded', 'false');
    more.append(el('span', null, 'More'));
    more.append(el('span', 'pd-features-chevron', '⌄'));

    more.addEventListener('click', () => {
      const expanded = more.getAttribute('aria-expanded') === 'true';

      items.forEach((item, index) => {
        if (index >= VISIBLE_FEATURES) item.hidden = expanded;
      });

      more.setAttribute('aria-expanded', expanded ? 'false' : 'true');

      more.querySelector('span').textContent = expanded ? 'More' : 'Less';
    });

    footer.append(more);
  }

  if (product.specsUrl) {
    const specs = el('a', 'pd-specs-link', 'Product Specs ›');

    specs.href = product.specsUrl;

    footer.append(specs);
  }

  body.append(footer);

  return section;
}

function createVariants(product, store, config) {
  const { section, body } = createAccordion('Screen Size', {
    subtitle: 'Please select a screen size below',
  });

  const grid = el('div', 'pd-variants');

  const buttons = product.variants.map((variant) => {
    const button = el('button', 'pd-variant');

    button.type = 'button';
    button.dataset.sku = variant.sku;

    button.append(el('span', 'pd-variant-label', variant.label));
    button.append(el('span', 'pd-variant-price', formatPrice(variant.price, config)));

    if (!variant.available) {
      button.disabled = true;
      button.classList.add('is-unavailable');
      button.setAttribute('aria-label', `${variant.label} — out of stock`);
    }

    button.addEventListener('click', () => {
      if (!variant.available) return;

      /*
       * Changing the model invalidates the delivery answer, the
       * next variant may not ship to the same postcode.
       */
      store.set({
        ...AVAILABILITY_RESET,
        variantSku: variant.sku,
      });
    });

    grid.append(button);

    return button;
  });

  body.append(grid);

  store.subscribe((state) => {
    buttons.forEach((button) => {
      button.classList.toggle('is-selected', button.dataset.sku === state.variantSku);

      button.setAttribute(
        'aria-pressed',
        button.dataset.sku === state.variantSku ? 'true' : 'false',
      );
    });
  });

  return section;
}

/**
 * Right column, upper half.
 * @param {object} product normalised product
 * @param {object} store shared state
 * @param {{locale: string, currency: string}} config
 * @returns {HTMLElement}
 */
export default function createSummary(product, store, config) {
  const root = el('div', 'pd-summary');

  if (product.badge) root.append(el('p', 'pd-badge', product.badge));

  root.append(el('h1', 'pd-title', product.name));

  root.append(createSkuRow(product));

  root.append(createRatingRow(product));

  product.promos.forEach((promo) => root.append(createPromo(promo)));

  if (product.keyFeatures.length) root.append(createKeyFeatures(product));

  if (product.variants.length) root.append(createVariants(product, store, config));

  return root;
}
