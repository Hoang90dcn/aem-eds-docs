import { createTabs } from './tabs.js';
import { createCarousel } from './carousel.js';
import { createProductCard } from './product-card.js';

export function renderFeaturedProducts(block, config, data) {
  block.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'featured-products__wrapper';

  // Header
  const header = document.createElement('div');
  header.className = 'featured-products__header';

  const title = document.createElement('h2');
  title.className = 'featured-products__title';
  title.textContent = config.title;

  header.append(title);

  // Tabs
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'featured-products__tabs';

  // Products
  const productsContainer = document.createElement('div');
  productsContainer.className = 'featured-products__products';

  wrapper.append(header);
  wrapper.append(tabsContainer);
  wrapper.append(productsContainer);

  block.append(wrapper);

  if (!data.tabs.length) {
    productsContainer.innerHTML =
      '<div class="featured-products__empty">No Products</div>';
    return;
  }

  let carousel;

  function changeTab(index) {
    if (carousel) {
      carousel.destroy();
    }

    carousel = createCarousel({
      container: productsContainer,
      items: data.tabs[index].products,
      renderItem: createProductCard,
      slidesPerView: 4,
    });
  }

  createTabs({
    container: tabsContainer,
    tabs: data.tabs,
    activeIndex: 0,
    onChange: changeTab,
  });

  changeTab(0);
}