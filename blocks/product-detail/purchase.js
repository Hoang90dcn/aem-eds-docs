import {
  el, formatPrice, parsePostcode, nextId,
} from './utils.js';
import createAccordion from './accordion.js';
import { selectTotals, STATUS, AVAILABILITY_RESET } from './state.js';

const CHECK_ICON = `
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path d="m2.5 8.5 3.5 3.5 7.5-7.5" />
  </svg>
`;

const PAYPAL_INSTALMENTS = 30;

/* ---------------------------------------------------------
   POSTCODE
--------------------------------------------------------- */

function createPostcodeCheck(product, store) {
  const root = el('section', 'pd-postcode');

  root.append(el('h2', 'pd-postcode-title', 'Check delivery for your area'));

  const form = el('form', 'pd-postcode-form');

  const inputId = nextId('pd-postcode');

  const label = el('label', 'sr-only', 'Postcode');

  label.htmlFor = inputId;

  const input = el('input', 'pd-postcode-input');

  input.id = inputId;
  input.type = 'text';
  input.name = 'postcode';
  input.autocomplete = 'postal-code';
  input.placeholder = 'Enter your postcode';

  const submit = el('button', 'pd-postcode-submit', 'Check');

  submit.type = 'submit';

  form.append(label, input, submit);
  root.append(form);

  const message = el('p', 'pd-postcode-message');

  message.setAttribute('role', 'status');
  message.hidden = true;

  root.append(message);

  const notice = el('div', 'pd-unavailable');

  notice.hidden = true;

  notice.append(el('span', 'pd-unavailable-icon', '!'));

  const noticeBody = el('span', 'pd-unavailable-body');

  noticeBody.append(
    el('strong', 'pd-unavailable-title', product.availability.unavailableTitle),
  );

  const noticeText = el('span', 'pd-unavailable-text');

  noticeBody.append(noticeText);
  notice.append(noticeBody);

  root.append(notice);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const parsed = parsePostcode(input.value);
    const { availability } = product;

    if (!parsed) {
      store.set({
        ...AVAILABILITY_RESET,
        postcode: input.value.trim(),
        status: STATUS.INVALID,
        message: availability.invalidMessage,
      });

      return;
    }

    const deliverable = availability.servicedOutwardCodes.includes(parsed.outward);

    input.value = parsed.formatted;

    store.set({
      ...(deliverable ? {} : AVAILABILITY_RESET),
      postcode: parsed.formatted,
      status: deliverable ? STATUS.AVAILABLE : STATUS.UNAVAILABLE,
      message: deliverable
        ? availability.deliverableMessage
        : availability.notDeliverableMessage,
    });
  });

  /*
   * Editing after a check invalidates the previous answer, so the
   * bundles cannot survive a changed postcode.
   */
  input.addEventListener('input', () => {
    if (store.get().status === STATUS.IDLE) return;

    store.set({ ...AVAILABILITY_RESET });
  });

  store.subscribe((state) => {
    const ok = state.status === STATUS.AVAILABLE;
    const unavailable = state.status === STATUS.UNAVAILABLE;

    /* the dedicated notice carries the out of area case */
    message.hidden = !state.message || unavailable;

    message.replaceChildren();

    if (ok) {
      const tick = el('span', 'pd-postcode-tick');

      tick.innerHTML = CHECK_ICON;

      message.append(tick);
    }

    message.append(document.createTextNode(state.message || ''));

    message.classList.toggle('is-ok', ok);
    message.classList.toggle('is-error', state.status === STATUS.INVALID);

    notice.hidden = !unavailable;

    if (unavailable) noticeText.textContent = state.message;
  });

  return root;
}

/* ---------------------------------------------------------
   BUNDLES
--------------------------------------------------------- */

function createBundles(product, store, config) {
  const { section, body } = createAccordion('Bundle Options', {
    note: product.bundleNote,
  });

  const list = el('div', 'pd-bundles');

  const checkboxes = [];

  product.bundles.forEach((bundle) => {
    const row = el('label', 'pd-bundle');

    const checkbox = el('input', 'pd-bundle-check');

    checkbox.type = 'checkbox';
    checkbox.value = bundle.id;

    const thumb = el('span', 'pd-bundle-thumb');

    const info = el('span', 'pd-bundle-info');

    info.append(el('span', 'pd-bundle-name', bundle.name));

    const prices = el('span', 'pd-bundle-prices');

    prices.append(el('span', 'pd-bundle-price', formatPrice(bundle.price, config)));

    if (bundle.wasPrice) {
      prices.append(el('s', 'pd-bundle-was', formatPrice(bundle.wasPrice, config)));
    }

    if (bundle.saveLabel) {
      prices.append(el('span', 'pd-bundle-save', bundle.saveLabel));
    }

    info.append(prices);

    row.append(checkbox, thumb, info);

    checkbox.addEventListener('change', () => {
      const current = store.get().bundles;

      const bundles = checkbox.checked
        ? [...current, bundle.id]
        : current.filter((id) => id !== bundle.id);

      store.set({ bundles });
    });

    checkboxes.push({ id: bundle.id, checkbox });

    list.append(row);
  });

  body.append(list);

  const footer = el('div', 'pd-bundles-footer');

  const count = el('span', 'pd-bundles-count');

  const total = el('span', 'pd-bundles-total');

  footer.append(count, total);
  body.append(footer);

  store.subscribe((state) => {
    /* bundle pricing is per area, so it waits for the check */
    section.hidden = state.status !== STATUS.AVAILABLE;

    /* keep the boxes in step when the selection is reset */
    checkboxes.forEach((entry) => {
      entry.checkbox.checked = state.bundles.includes(entry.id);
    });

    const selected = product.bundles.filter((item) => state.bundles.includes(item.id));

    const sum = selected.reduce((value, item) => value + item.price, 0);

    count.textContent = `Add Item (${selected.length})`;
    total.textContent = formatPrice(sum, config);
  });

  return section;
}

/* ---------------------------------------------------------
   DEALS
--------------------------------------------------------- */

function createDeals(product) {
  const { section, body } = createAccordion('Deals & Offers');

  product.deals.forEach((deal) => {
    const row = el('div', 'pd-deal');

    row.append(el('span', 'pd-deal-icon', '%'));
    row.append(el('p', 'pd-deal-text', deal.text));

    body.append(row);
  });

  return section;
}

/* ---------------------------------------------------------
   DELIVERY OPTIONS
--------------------------------------------------------- */

function createDeliveryOptions(product, store, config) {
  const { section, body } = createAccordion('Delivery Option');

  const name = nextId('pd-delivery');

  const list = el('div', 'pd-delivery');

  product.deliveryOptions.forEach((option) => {
    const row = el('label', 'pd-delivery-option');

    const radio = el('input');

    radio.type = 'radio';
    radio.name = name;
    radio.value = option.id;

    const info = el('span', 'pd-delivery-info');

    const heading = el('span', 'pd-delivery-label');

    heading.append(el('span', null, option.label));

    if (option.note) {
      const hint = el('span', 'pd-delivery-hint');

      hint.title = option.note;
      hint.textContent = 'i';

      heading.append(hint);
    }

    info.append(heading);
    info.append(el('span', 'pd-delivery-price', formatPrice(option.price, config)));

    row.append(radio, info);

    radio.addEventListener('change', () => {
      if (radio.checked) store.set({ deliveryId: option.id });
    });

    store.subscribe((state) => {
      radio.checked = state.deliveryId === option.id;

      row.classList.toggle('is-selected', state.deliveryId === option.id);
    });

    list.append(row);
  });

  body.append(list);

  store.subscribe((state) => {
    /* delivery is quoted per area, same rule as the bundles */
    section.hidden = state.status !== STATUS.AVAILABLE;
  });

  return section;
}

/* ---------------------------------------------------------
   LEGAL
--------------------------------------------------------- */

function createLegal(product) {
  const list = el('ul', 'pd-legal');

  product.legal.forEach((line, index) => {
    const item = el('li', null, line);

    if (index === 0 && product.returnPolicy) {
      const link = el('a', 'pd-legal-link', product.returnPolicy.label);

      link.href = product.returnPolicy.href;

      item.append(' ', link);
    }

    list.append(item);
  });

  return list;
}

/* ---------------------------------------------------------
   ORDER SUMMARY
--------------------------------------------------------- */

function createOrderSummary(product, store, config) {
  const root = el('section', 'pd-order');

  const sheet = el('div', 'pd-order-sheet');

  sheet.append(el('span', 'pd-order-sheet-icon', '⬤'));
  sheet.append(el('span', null, 'Product Information Sheet'));

  root.append(sheet);

  const subtotalRow = el('div', 'pd-order-row pd-order-subtotal');

  subtotalRow.append(el('span', null, 'Subtotal (VAT Included)'));

  const subtotalValue = el('span', 'pd-order-value');

  subtotalRow.append(subtotalValue);
  root.append(subtotalRow);

  const lineRow = el('div', 'pd-order-row pd-order-line');

  const lineLabel = el('span', 'pd-order-line-label');

  const lineValue = el('span', 'pd-order-value');

  lineRow.append(lineLabel, lineValue);
  root.append(lineRow);

  const totalRow = el('div', 'pd-order-row pd-order-total');

  totalRow.append(el('span', null, 'Grand Total'));

  const totalValue = el('span', 'pd-order-value');

  totalRow.append(totalValue);
  root.append(totalRow);

  const instalments = el('p', 'pd-order-instalments');

  root.append(instalments);

  /* quantity */

  const qtyRow = el('div', 'pd-qty');

  const minus = el('button', 'pd-qty-button', '−');

  minus.type = 'button';
  minus.setAttribute('aria-label', 'Decrease quantity');

  const qtyValue = el('output', 'pd-qty-value');

  const plus = el('button', 'pd-qty-button', '+');

  plus.type = 'button';
  plus.setAttribute('aria-label', 'Increase quantity');

  qtyRow.append(minus, qtyValue, plus);
  root.append(qtyRow);

  minus.addEventListener('click', () => {
    const { quantity } = store.get();

    if (quantity <= 1) return;

    store.set({ quantity: quantity - 1 });
  });

  plus.addEventListener('click', () => {
    store.set({ quantity: store.get().quantity + 1 });
  });

  const actions = el('div', 'pd-actions');

  const basket = el('button', 'pd-action pd-action-basket', 'Add to Basket');

  basket.type = 'button';

  const checkout = el('button', 'pd-action pd-action-checkout', 'Checkout');

  checkout.type = 'button';

  actions.append(basket, checkout);

  root.append(actions);

  const payments = el('ul', 'pd-payments');

  product.payments.forEach((brand) => {
    payments.append(el('li', `pd-payment pd-payment-${brand}`, brand));
  });

  root.append(payments);

  store.subscribe((state) => {
    const {
      variant, delivery, subtotal, total,
    } = selectTotals(product, state);

    subtotalValue.textContent = formatPrice(subtotal, config);

    lineLabel.textContent = `${variant ? variant.sku : ''} (Qty ${state.quantity})`;
    lineValue.textContent = formatPrice(
      (variant ? variant.price : 0) * state.quantity,
      config,
    );

    totalValue.textContent = formatPrice(total, config);

    instalments.textContent = `or ${PAYPAL_INSTALMENTS} payments of ${formatPrice(
      total / PAYPAL_INSTALMENTS,
      config,
    )} with PayPal`;

    qtyValue.textContent = String(state.quantity);
    minus.disabled = state.quantity <= 1;

    /*
     * Ordering is open by default and only closes once a check
     * proves we cannot ship to that area.
     */
    const blocked = state.status === STATUS.UNAVAILABLE;

    basket.disabled = blocked;
    checkout.disabled = blocked;

    root.classList.toggle('is-blocked', blocked);

    root.dataset.delivery = delivery ? delivery.id : '';
  });

  return root;
}

/* ---------------------------------------------------------
   ENTRY
--------------------------------------------------------- */

/**
 * Right column, lower half.
 * @param {object} product normalised product
 * @param {object} store shared state
 * @param {{locale: string, currency: string}} config
 * @returns {HTMLElement}
 */
export default function createPurchase(product, store, config) {
  const root = el('div', 'pd-purchase');

  root.append(createPostcodeCheck(product, store));

  if (product.bundles.length) root.append(createBundles(product, store, config));

  if (product.deals.length) root.append(createDeals(product));

  if (product.deliveryOptions.length) {
    root.append(createDeliveryOptions(product, store, config));
  }

  if (product.legal.length) root.append(createLegal(product));

  root.append(createOrderSummary(product, store, config));

  return root;
}
