/*
 * Product Detail Block — the "buy now" page.
 *
 * Authored structure:
 *
 *   | Product Detail |                          |
 *   | Sku            | OLED83C6ELB              |
 *   | Api            | /api/product             |  (optional)
 *   | Currency       | GBP                      |  (optional)
 *   | Locale         | en-GB                    |  (optional)
 *
 * Without an Api the block renders the bundled fixture, so the
 * page is authorable and testable before the feed exists.
 */

import { el } from './utils.js';
import createStore, { selectTotals, STATUS } from './state.js';
import { adaptProduct } from './adapter.js';
import createGallery from './gallery.js';
import createSummary from './summary.js';
import createPurchase from './purchase.js';

const DEFAULTS = {
  currency: 'GBP',
  locale: 'en-GB',
};

function readConfig(block) {
  const config = { ...DEFAULTS, sku: '', api: '' };

  [...block.children].forEach((row) => {
    const [label, value] = [...row.children];

    if (!value) return;

    const key = label.textContent.trim().toLowerCase();
    const text = value.textContent.trim();

    if (!key || !text) return;

    if (key === 'sku') config.sku = text;
    if (key === 'api') config.api = value.querySelector('a')?.getAttribute('href') || text;
    if (key === 'currency') config.currency = text;
    if (key === 'locale') config.locale = text;
  });

  return config;
}

async function loadProduct(config) {
  if (!config.api) {
    const { MOCK_PRODUCT } = await import('./mockData.js');

    return MOCK_PRODUCT;
  }

  const { fetchProduct } = await import('./api.js');

  return fetchProduct(config);
}

function firstAvailableSku(product, requestedSku) {
  const requested = product.variants.find(
    (variant) => variant.sku === requestedSku && variant.available,
  );

  if (requested) return requested.sku;

  const available = product.variants.find((variant) => variant.available);

  return available ? available.sku : product.sku;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readConfig(block);

  let product;

  try {
    product = adaptProduct(await loadProduct(config));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Product Detail: unable to load product', error);

    block.replaceChildren(
      el('p', 'pd-error', 'Sorry, this product is temporarily unavailable.'),
    );

    return;
  }

  if (!product.name) {
    block.replaceChildren();

    return;
  }

  const store = createStore({
    variantSku: firstAvailableSku(product, config.sku),
    quantity: 1,
    bundles: [],
    deliveryId: product.deliveryOptions[0]?.id || null,
    postcode: '',
    status: STATUS.IDLE,
    message: '',
  });

  const layout = el('div', 'pd-layout');

  const left = el('div', 'pd-column pd-column-media');

  left.append(createGallery(product));

  const right = el('div', 'pd-column pd-column-buy');

  right.append(createSummary(product, store, config));
  right.append(createPurchase(product, store, config));

  layout.append(left, right);

  block.replaceChildren(layout);

  /*
   * One initial publish so every subscriber paints its first
   * state from the same source of truth.
   */
  store.set({});

  block.addEventListener('click', (event) => {
    const action = event.target.closest('.pd-action');

    if (!action) return;

    const state = store.get();

    /*
     * Buying stays open until a check proves the area is not
     * served, matching the initial state of the design.
     */
    if (state.status === STATUS.UNAVAILABLE) return;

    const {
      variant, bundles, delivery, total,
    } = selectTotals(product, state);

    block.dispatchEvent(
      new CustomEvent('product-detail:order', {
        bubbles: true,
        detail: {
          intent: action.classList.contains('pd-action-checkout') ? 'checkout' : 'basket',
          sku: variant?.sku,
          quantity: state.quantity,
          bundles: bundles.map((item) => item.id),
          delivery: delivery?.id,
          postcode: state.postcode,
          total,
          currency: config.currency,
        },
      }),
    );
  });
}
