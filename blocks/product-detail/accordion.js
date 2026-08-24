import { el, nextId } from './utils.js';

/**
 * Collapsible section used by every panel on the right column.
 * @param {string} title heading text
 * @param {{open?: boolean, subtitle?: string, note?: string}} options
 * @returns {{section: HTMLElement, body: HTMLElement}}
 */
export default function createAccordion(title, options = {}) {
  const { open = true, subtitle = '', note = '' } = options;

  const bodyId = nextId('pd-panel');

  const section = el('section', 'pd-accordion');

  const toggle = el('button', 'pd-accordion-toggle');

  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  toggle.setAttribute('aria-controls', bodyId);

  toggle.append(el('span', 'pd-accordion-title', title));
  toggle.append(el('span', 'pd-accordion-chevron'));

  section.append(toggle);

  const body = el('div', 'pd-accordion-body');

  body.id = bodyId;

  if (!open) body.hidden = true;

  if (subtitle) body.append(el('p', 'pd-accordion-subtitle', subtitle));

  if (note) body.append(el('p', 'pd-accordion-note', note));

  section.append(body);

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';

    toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');

    body.hidden = expanded;
  });

  return { section, body };
}
