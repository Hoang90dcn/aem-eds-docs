/*
 * Product Detail API
 *
 * Mirrors the shape of blocks/featured-products/api.js so both
 * can move to the same client later.
 */

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

async function handleResponse(response) {
  if (!response.ok) {
    const message = await response.text();

    throw new Error(`Product Detail API Error ${response.status}: ${message}`);
  }

  return response.json();
}

/**
 * @param {{api: string, sku: string}} config
 * @returns {Promise<object>} raw API payload
 */
export async function fetchProduct(config) {
  if (!config.api) {
    throw new Error('Missing API url.');
  }

  const url = new URL(config.api, window.location.origin);

  url.searchParams.set('sku', config.sku);

  const response = await fetch(url, { headers: DEFAULT_HEADERS });

  return handleResponse(response);
}

export default fetchProduct;
