/*
 * Normalises whatever the API returns into the single shape the
 * renderers read, and fills the gaps so a partial payload cannot
 * break the page.
 */

const EMPTY = {
  sku: '',
  name: '',
  badge: '',
  rating: 0,
  reviewCount: 0,
  gallery: [],
  keyFeatures: [],
  specsUrl: '',
  promos: [],
  variants: [],
  bundleNote: '',
  bundles: [],
  deals: [],
  deliveryOptions: [],
  availability: {
    servicedOutwardCodes: [],
    deliverableMessage: 'We can deliver to this postcode',
    notDeliverableMessage: 'Sorry, we cannot deliver this product to your postcode.',
    invalidMessage: 'Please enter a valid postcode.',
    unavailableTitle: 'This product is not available in your area',
  },
  legal: [],
  returnPolicy: null,
  payments: [],
};

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function adaptVariant(raw, index) {
  return {
    sku: raw.sku || raw.id || `variant-${index}`,
    label: raw.label || raw.size || '',
    price: toNumber(raw.price),
    /* absent means orderable, only an explicit false disables it */
    available: raw.available !== false,
  };
}

function adaptBundle(raw, index) {
  return {
    id: raw.id || raw.sku || `bundle-${index}`,
    name: raw.name || '',
    price: toNumber(raw.price),
    wasPrice: raw.wasPrice != null ? toNumber(raw.wasPrice) : null,
    saveLabel: raw.saveLabel || '',
    image: raw.image || '',
  };
}

function adaptDelivery(raw, index) {
  return {
    id: raw.id || `delivery-${index}`,
    label: raw.label || '',
    price: toNumber(raw.price),
    note: raw.note || '',
  };
}

/**
 * @param {object} raw API payload or mock fixture
 * @returns {object} normalised product
 */
export function adaptProduct(raw) {
  const source = raw && raw.product ? raw.product : raw;

  if (!source) return { ...EMPTY };

  return {
    ...EMPTY,
    ...source,

    rating: toNumber(source.rating),
    reviewCount: toNumber(source.reviewCount),

    gallery: (source.gallery || []).filter((item) => item && item.src),

    keyFeatures: source.keyFeatures || [],

    promos: source.promos || [],

    variants: (source.variants || []).map(adaptVariant),

    bundles: (source.bundles || []).map(adaptBundle),

    deals: source.deals || [],

    deliveryOptions: (source.deliveryOptions || []).map(adaptDelivery),

    availability: {
      ...EMPTY.availability,
      ...(source.availability || {}),
    },

    legal: source.legal || [],

    payments: source.payments || [],
  };
}

export default adaptProduct;
