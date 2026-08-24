/*
 * Hero Block
 *
 * A full width promo banner with a background image, a headline
 * that carries a "search pill" highlight, and a call to action.
 *
 * Authored structure:
 *
 *   | Hero  |                                                     |
 *   | Image | <picture>                                           |
 *   | Title | Tìm kiếm **InstaView** nâng tầm không gian bếp...   |
 *   | Link  | [Khám phá Tủ lạnh InstaView](/vn/tu-lanh-instaview) |
 *
 * The bold run inside Title becomes the pill. Every field is
 * optional, the block degrades to whatever the author supplied.
 */

const SEARCH_ICON = `
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.2"
    stroke-linecap="round"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m20 20-4.7-4.7" />
  </svg>
`;

const ARROW_ICON = `
  <svg
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="m4 2 4 4-4 4" />
  </svg>
`;

/*
 * Rows are authored as "Label | Value". Return the value cells
 * keyed by their label so extra or reordered rows keep working.
 */
function readFields(block) {
  const fields = {};

  [...block.children].forEach((row) => {
    const [label, value] = [...row.children];

    if (!value) return;

    const key = label.textContent.trim().toLowerCase();

    if (key) fields[key] = value;
  });

  return fields;
}

function createIcon(className, markup) {
  const icon = document.createElement('span');

  icon.className = className;
  icon.innerHTML = markup;

  return icon;
}

function createSearchPill(label) {
  const pill = document.createElement('span');

  pill.className = 'hero-search';

  pill.append(createIcon('hero-search-icon', SEARCH_ICON));

  const text = document.createElement('span');

  text.className = 'hero-search-label';
  text.textContent = label;

  pill.append(text);

  return pill;
}

/*
 * Rebuild the headline word for word so the highlighted run can
 * be swapped for the pill while the rest stays plain text.
 */
function createTitle(cell) {
  const title = document.createElement('p');

  title.className = 'hero-title';

  if (!cell) return title;

  const source = cell.querySelector('p') || cell;

  const highlight = source.querySelector('strong, b, em');

  [...source.childNodes].forEach((node) => {
    if (highlight && node === highlight) {
      title.append(createSearchPill(highlight.textContent.trim()));

      return;
    }

    const text = node.textContent.trim();

    if (!text) return;

    const span = document.createElement('span');

    span.textContent = text;

    title.append(span);
  });

  return title;
}

function createDescription(anchor) {
  if (!anchor) return null;

  const label = anchor.textContent.trim();

  if (!label) return null;

  const description = document.createElement('p');

  description.className = 'hero-desc';

  /*
   * The whole banner is already a link, so this stays a span
   * to avoid nesting anchors.
   */
  const text = document.createElement('span');

  text.className = 'hero-desc-text';
  text.textContent = label;

  text.append(createIcon('hero-desc-icon', ARROW_ICON));

  description.append(text);

  return description;
}

function createBackground(picture) {
  const background = document.createElement('div');

  background.className = 'hero-bg';

  background.setAttribute('aria-hidden', 'true');

  if (picture) {
    background.append(picture);

    const image = picture.querySelector('img');

    /*
     * Decorative, the headline already carries the message.
     */
    if (image) image.setAttribute('alt', '');
  }

  return background;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const fields = readFields(block);

  const picture = (fields.image || block).querySelector('picture');

  const anchor = (fields.link || block).querySelector('a');

  const titleCell = fields.title || null;

  const href = anchor?.getAttribute('href');

  const banner = document.createElement(href ? 'a' : 'div');

  banner.className = 'hero-banner';

  if (href) banner.href = href;

  banner.append(createBackground(picture));

  banner.append(createTitle(titleCell));

  const description = createDescription(anchor);

  if (description) banner.append(description);

  block.replaceChildren(banner);
}
