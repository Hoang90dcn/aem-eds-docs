import { el } from './utils.js';

const GALLERY_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8.5" cy="10" r="1.5" />
    <path d="m5 17 4.5-4.5L13 16l2.5-2.5L19 17" />
  </svg>
`;

const CHEVRON = `
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path d="m7.5 2-4 4 4 4" />
  </svg>
`;

const THUMBS_PER_PAGE = 5;

/**
 * Left column: stage image, thumbnail strip, pager.
 * @param {object} product normalised product
 * @returns {HTMLElement}
 */
export default function createGallery(product) {
  const root = el('div', 'pd-gallery');

  const images = product.gallery;

  if (!images.length) return root;

  let active = 0;
  let page = 0;

  const stage = el('div', 'pd-gallery-stage');

  const mainImage = el('img', 'pd-gallery-image');

  mainImage.src = images[0].src;
  mainImage.alt = images[0].alt || product.name;
  /* above the fold, so it must not be lazy */
  mainImage.loading = 'eager';
  mainImage.decoding = 'async';

  stage.append(mainImage);
  root.append(stage);

  const thumbs = el('ul', 'pd-gallery-thumbs');

  const buttons = images.map((image, index) => {
    const item = el('li');

    const button = el('button', 'pd-gallery-thumb');

    button.type = 'button';
    button.setAttribute('aria-label', `View image ${index + 1} of ${images.length}`);

    const thumbImage = el('img');

    thumbImage.src = image.src;
    thumbImage.alt = '';
    thumbImage.loading = 'lazy';
    thumbImage.decoding = 'async';

    button.append(thumbImage);
    item.append(button);
    thumbs.append(item);

    return { item, button };
  });

  root.append(thumbs);

  const pager = el('div', 'pd-gallery-pager');

  const prev = el('button', 'pd-gallery-nav pd-gallery-prev');

  prev.type = 'button';
  prev.innerHTML = CHEVRON;
  prev.setAttribute('aria-label', 'Previous images');

  const counter = el('span', 'pd-gallery-counter');

  const next = el('button', 'pd-gallery-nav pd-gallery-next');

  next.type = 'button';
  next.innerHTML = CHEVRON;
  next.setAttribute('aria-label', 'Next images');

  pager.append(prev, counter, next);
  root.append(pager);

  const galleryLink = el('button', 'pd-gallery-open');

  galleryLink.type = 'button';
  galleryLink.innerHTML = GALLERY_ICON;
  galleryLink.append(el('span', null, 'Gallery'));

  root.append(galleryLink);

  const pageCount = Math.max(1, Math.ceil(images.length / THUMBS_PER_PAGE));

  function renderPage() {
    buttons.forEach(({ item }, index) => {
      const inPage = Math.floor(index / THUMBS_PER_PAGE) === page;

      item.hidden = !inPage;
    });

    /* counts images, not pages, so it reads 1 / 15 */
    counter.textContent = `${active + 1} / ${images.length}`;

    prev.disabled = page === 0;
    next.disabled = page === pageCount - 1;
  }

  function setActive(index) {
    active = index;

    mainImage.src = images[index].src;
    mainImage.alt = images[index].alt || product.name;

    buttons.forEach(({ button }, position) => {
      button.classList.toggle('is-active', position === index);

      button.setAttribute('aria-current', position === index ? 'true' : 'false');
    });

    page = Math.floor(index / THUMBS_PER_PAGE);

    renderPage();
  }

  buttons.forEach(({ button }, index) => {
    button.addEventListener('click', () => setActive(index));
  });

  prev.addEventListener('click', () => {
    if (page === 0) return;

    page -= 1;

    renderPage();
  });

  next.addEventListener('click', () => {
    if (page >= pageCount - 1) return;

    page += 1;

    renderPage();
  });

  galleryLink.addEventListener('click', () => {
    setActive((active + 1) % images.length);
  });

  setActive(0);
  renderPage();

  return root;
}
