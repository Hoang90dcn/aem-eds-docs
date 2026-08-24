/*
 * Utils
 *
 * Kept local so the block stays self contained.
 */

export function el(tag, className, text) {
  const node = document.createElement(tag);

  if (className) node.className = className;

  if (text != null) node.textContent = text;

  return node;
}

/*
 * Intl picks the right number of decimals per currency, so GBP
 * renders 3,999.98 and VND renders 3.999.
 */
export function formatPrice(value, config = {}) {
  const { locale = 'en-GB', currency = 'GBP' } = config;

  if (value == null || value === '') return '';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(Number(value));
}

/*
 * "ng275ey" and "NG27 5EY" are the same place. Returns the
 * outward code, or null when the shape is not a UK postcode.
 */
export function parsePostcode(value) {
  const cleaned = String(value || '')
    .toUpperCase()
    .replace(/\s+/g, '');

  if (!/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(cleaned)) return null;

  const inward = cleaned.slice(-3);
  const outward = cleaned.slice(0, -3);

  return { outward, formatted: `${outward} ${inward}` };
}

let uid = 0;

export function nextId(prefix) {
  uid += 1;

  return `${prefix}-${uid}`;
}
