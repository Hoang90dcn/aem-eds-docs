import { parseConfig } from './parser.js';
import { fetchProducts } from './api.js';
import { renderFeaturedProducts } from './renderer.js';
import mockData from './mockData.js';

export default async function decorate(block) {
  block.classList.add('featured-products');

  try {
    // Parse Google Docs configuration
    const config = parseConfig(block);

    // Loading
    block.innerHTML = `
      <div class="featured-products__loading">
        <div class="featured-products__spinner"></div>
      </div>
    `;

    // Call API
    const response = mockData;
    console.log('[Featured Products] mockData', response);

    // Render
    renderFeaturedProducts(block, config, response);

  } catch (error) {

    console.error('[Featured Products]', error);

    block.innerHTML = `
      <div class="featured-products__error">
        Unable to load featured products.
      </div>
    `;
  }
}