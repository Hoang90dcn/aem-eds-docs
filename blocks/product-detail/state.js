/*
 * A tiny observable store.
 *
 * Every section renders from it and subscribes to changes, so the
 * postcode check can gate the buy buttons without the sections
 * having to know about each other.
 */
/*
 * Delivery check outcomes.
 *
 *   idle        nothing checked yet — the page opens here
 *   invalid     the input was not a postcode
 *   available   we ship this model to that area
 *   unavailable we do not
 *
 * Bundles and delivery options only exist while `available`,
 * because both are quoted per area.
 */
export const STATUS = {
  IDLE: 'idle',
  INVALID: 'invalid',
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
};

/*
 * Applied whenever a previous answer stops being valid. Clearing
 * the bundles matters: the panel disappears with them, and a
 * hidden selection would silently inflate the total.
 */
export const AVAILABILITY_RESET = {
  status: STATUS.IDLE,
  message: '',
  bundles: [],
};

export default function createStore(initial) {
  let state = { ...initial };

  const listeners = new Set();

  return {
    get() {
      return state;
    },

    set(patch) {
      const next = { ...state, ...patch };

      state = next;

      listeners.forEach((listener) => listener(next));
    },

    subscribe(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };
}

/**
 * The order total, derived rather than stored so it can never
 * drift out of sync with the selections.
 * @param {object} product normalised product
 * @param {object} state current store state
 * @returns {object} selected variant, bundles, delivery, subtotal and total
 */
export function selectTotals(product, state) {
  const variant = product.variants.find((item) => item.sku === state.variantSku)
    || product.variants[0];

  /*
   * Bundles and delivery are only offered once an area is
   * confirmed, so they must not reach the total before that —
   * an invisible line item would make the maths look wrong.
   */
  const offered = state.status === STATUS.AVAILABLE;

  const bundles = offered
    ? product.bundles.filter((item) => state.bundles.includes(item.id))
    : [];

  const delivery = offered
    ? product.deliveryOptions.find((item) => item.id === state.deliveryId) || null
    : null;

  const bundleTotal = bundles.reduce((sum, item) => sum + item.price, 0);

  const subtotal = (variant ? variant.price : 0) * state.quantity + bundleTotal;

  const total = subtotal + (delivery ? delivery.price : 0);

  return {
    variant, bundles, delivery, subtotal, total,
  };
}
