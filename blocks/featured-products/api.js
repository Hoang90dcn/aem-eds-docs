/**
 * Featured Products API
 */

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

function createPayload(config) {
  return {
    bizType: config.bizType,
    isMember: config.isMember,
    subscribeProduct: config.subscribeProduct,
    productList: config.productList,
  };
}

async function handleResponse(response) {
  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `Featured Products API Error ${response.status}: ${message}`,
    );
  }

  return response.json();
}

export async function fetchProducts(config) {
  if (!config.api) {
    throw new Error('Missing API url.');
  }

  const response = await fetch(config.api, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(createPayload(config)),
  });

  return handleResponse(response);
}