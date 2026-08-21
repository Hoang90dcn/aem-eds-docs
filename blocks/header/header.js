import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

/* =========================================================
   HELPERS
========================================================= */

function getText(element) {
  return element?.textContent?.trim() || '';
}

function getCell(row, index) {
  return row?.children?.[index] || null;
}

function getCellText(row, index) {
  return getText(getCell(row, index));
}


/* =========================================================
   BRAND
========================================================= */

function setupBrand(brand) {
  if (!brand) return;

  const row = brand.children[0];

  if (!row) return;

  const content = row.querySelector('div');

  if (!content) return;

  const link = content.querySelector('a');

  /*
   * If Google Docs contains a link
   */
  if (link) {
    link.classList.add('nav-brand-link');
    return;
  }

  /*
   * If Google Docs only contains text/logo
   */
  const image = content.querySelector('img');

  if (image) {
    const brandLink = document.createElement('a');

    brandLink.className = 'nav-brand-link';

    brandLink.href = '/';

    image.parentElement?.replaceChild(
      brandLink,
      image,
    );

    brandLink.append(image);

    return;
  }

  /*
   * Text logo
   */
  const text = getText(content);

  if (text) {
    const brandLink = document.createElement('a');

    brandLink.className = 'nav-brand-link';

    brandLink.href = '/';

    brandLink.textContent = text;

    content.replaceChildren(brandLink);
  }
}


/* =========================================================
   SECTIONS
========================================================= */

function setupSections(navSections) {
  if (!navSections) return;

  /*
   * Current EDS structure:
   *
   * .sections.block
   *   <div>
   *     <div>
   *       <p>Products</p>
   *     </div>
   *   </div>
   *
   * Convert it to:
   *
   * <ul>
   *   <li>
   *     <a href="#">Products</a>
   *   </li>
   * </ul>
   */

  const rows = [...navSections.children];

  if (!rows.length) return;

  /*
   * Already converted
   */
  if (
    navSections.querySelector(
      ':scope > ul',
    )
  ) {
    return;
  }

  const list = document.createElement('ul');

  rows.forEach((row) => {
    const content =
      row.querySelector(':scope > div') ||
      row;

    const link =
      content.querySelector('a');

    const label =
      link?.textContent?.trim() ||
      content.textContent?.trim() ||
      '';

    if (!label) return;

    const li =
      document.createElement('li');

    const anchor =
      document.createElement('a');

    anchor.href =
      link?.getAttribute('href') || '#';

    anchor.textContent = label;

    /*
     * If this is a dropdown later,
     * nested UL can be detected here.
     */
    const nestedList =
      content.querySelector(
        ':scope > ul',
      );

    li.append(anchor);

    if (nestedList) {
      li.classList.add('nav-drop');

      li.setAttribute(
        'aria-expanded',
        'false',
      );

      li.append(nestedList);
    }

    list.append(li);
  });

  navSections.replaceChildren(list);
}


/* =========================================================
   TOOLS
========================================================= */

function setupTools(navTools) {
  if (!navTools) return;

  /*
   * Prevent running twice
   */
  if (
    navTools.dataset.toolsDecorated === 'true'
  ) {
    return;
  }

  const rows = [...navTools.children];

  rows.forEach((row) => {
    /*
     * -----------------------------------------
     * Read Google Docs columns
     *
     * Label | Icon | Link
     * -----------------------------------------
     */

    const cells = [...row.children];

    let label = '';
    let iconName = '';
    let href = '#';

    /*
     * Case:
     *
     * Search
     *
     * Or:
     *
     * Search | search | /search
     */

    if (cells.length >= 1) {
      label =
        getCellText(row, 0);
    }

    if (cells.length >= 2) {
      iconName =
        getCellText(row, 1)
          .toLowerCase();
    }

    if (cells.length >= 3) {
      const link =
        cells[2]?.querySelector('a');

      href =
        link?.getAttribute('href') ||
        getCellText(row, 2) ||
        '#';
    }

    /*
     * If the block has already been
     * partially decorated.
     */
    const existingLink =
      row.querySelector(
        '.nav-tool-link',
      );

    if (existingLink) {
      label =
        existingLink
          .querySelector(
            '.nav-tool-label',
          )
          ?.textContent
          ?.trim() ||
        existingLink
          .getAttribute(
            'aria-label',
          ) ||
        label;

      href =
        existingLink.getAttribute(
          'href',
        ) ||
        href;

      const className =
        [...existingLink.classList]
          .find((name) =>
            name.startsWith(
              'nav-tool-',
            ) &&
            name !== 'nav-tool-link',
          );

      if (className) {
        iconName =
          className
            .replace(
              'nav-tool-',
              '',
            )
            .toLowerCase();
      }
    }

    if (!label) return;

    /*
     * -----------------------------------------
     * If no icon is configured,
     * use label as icon name
     *
     * Search -> search
     * Account -> account
     * -----------------------------------------
     */

    if (!iconName) {
      iconName =
        label.toLowerCase();
    }

    /*
     * -----------------------------------------
     * Create link
     * -----------------------------------------
     */

    const link =
      document.createElement('a');

    link.className =
      'nav-tool-link';

    link.classList.add(
      `nav-tool-${iconName}`,
    );

    link.href = href;

    link.setAttribute(
      'aria-label',
      label,
    );

    /*
     * -----------------------------------------
     * Icon
     * -----------------------------------------
     */

    const icon =
      document.createElement('span');

    icon.className =
      'nav-tool-icon';

    icon.setAttribute(
      'aria-hidden',
      'true',
    );

    /*
     * -----------------------------------------
     * Label
     * -----------------------------------------
     */

    const text =
      document.createElement('span');

    text.className =
      'nav-tool-label';

    text.textContent = label;

    link.append(
      icon,
      text,
    );

    row.replaceChildren(link);
  });

  navTools.dataset.toolsDecorated = 'true';
}


/* =========================================================
   DROPDOWN
========================================================= */

function getDropdowns(navSections) {
  if (!navSections) return [];

  return [
    ...navSections.querySelectorAll(
      ':scope > ul > li.nav-drop',
    ),
  ];
}

function closeAllDropdowns(navSections) {
  getDropdowns(navSections).forEach(
    (item) => {
      item.setAttribute(
        'aria-expanded',
        'false',
      );
    },
  );
}

function toggleDropdown(
  item,
  forceExpanded = null,
) {
  if (
    !item?.classList.contains(
      'nav-drop',
    )
  ) {
    return;
  }

  const current =
    item.getAttribute(
      'aria-expanded',
    ) === 'true';

  const expanded =
    forceExpanded !== null
      ? forceExpanded
      : !current;

  const navSections =
    item.closest(
      '.nav-sections',
    );

  if (expanded) {
    closeAllDropdowns(
      navSections,
    );
  }

  item.setAttribute(
    'aria-expanded',
    expanded
      ? 'true'
      : 'false',
  );
}


/* =========================================================
   DROPDOWN EVENTS
========================================================= */

function handleDropdownClick(event) {
  if (!isDesktop.matches) return;

  const item =
    event.currentTarget;

  const link =
    event.target.closest(
      ':scope > a',
    );

  if (!link) return;

  event.preventDefault();

  toggleDropdown(item);
}

function handleDropdownKeydown(event) {
  if (!isDesktop.matches) return;

  if (
    event.code !== 'Enter' &&
    event.code !== 'Space'
  ) {
    return;
  }

  event.preventDefault();

  toggleDropdown(
    event.currentTarget,
  );
}

function setupDropdowns(navSections) {
  if (!navSections) return;

  const items =
    navSections.querySelectorAll(
      ':scope > ul > li',
    );

  items.forEach((item) => {
    const submenu =
      item.querySelector(
        ':scope > ul',
      );

    if (!submenu) return;

    item.classList.add(
      'nav-drop',
    );

    item.setAttribute(
      'aria-expanded',
      'false',
    );

    item.removeEventListener(
      'click',
      handleDropdownClick,
    );

    item.addEventListener(
      'click',
      handleDropdownClick,
    );

    if (isDesktop.matches) {
      item.setAttribute(
        'tabindex',
        '0',
      );

      item.removeEventListener(
        'keydown',
        handleDropdownKeydown,
      );

      item.addEventListener(
        'keydown',
        handleDropdownKeydown,
      );
    }
  });
}

function cleanupDropdowns(navSections) {
  if (!navSections) return;

  const items =
    navSections.querySelectorAll(
      ':scope > ul > li.nav-drop',
    );

  items.forEach((item) => {
    item.removeAttribute(
      'tabindex',
    );

    item.removeEventListener(
      'click',
      handleDropdownClick,
    );

    item.removeEventListener(
      'keydown',
      handleDropdownKeydown,
    );
  });
}


/* =========================================================
   HAMBURGER
========================================================= */

function createHamburger(
  nav,
  navSections,
) {
  const existing =
    nav.querySelector(
      '.nav-hamburger',
    );

  if (existing) return;

  const hamburger =
    document.createElement('div');

  hamburger.className =
    'nav-hamburger';

  hamburger.innerHTML = `
    <button
      type="button"
      aria-controls="nav"
      aria-label="Open navigation"
      aria-expanded="false"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  `;

  const button =
    hamburger.querySelector(
      'button',
    );

  button.addEventListener(
    'click',
    () => {
      toggleMenu(
        nav,
        navSections,
      );
    },
  );

  nav.prepend(hamburger);
}


/* =========================================================
   MOBILE MENU
========================================================= */

function toggleMenu(
  nav,
  navSections,
  forceExpanded = null,
) {
  const current =
    nav.getAttribute(
      'aria-expanded',
    ) === 'true';

  const expanded =
    forceExpanded !== null
      ? forceExpanded
      : !current;

  nav.setAttribute(
    'aria-expanded',
    expanded
      ? 'true'
      : 'false',
  );

  const button =
    nav.querySelector(
      '.nav-hamburger button',
    );

  if (button) {
    button.setAttribute(
      'aria-expanded',
      expanded
        ? 'true'
        : 'false',
    );

    button.setAttribute(
      'aria-label',
      expanded
        ? 'Close navigation'
        : 'Open navigation',
    );
  }

  /*
   * Lock body scroll on mobile
   */
  if (!isDesktop.matches) {
    document.body.style.overflow =
      expanded
        ? 'hidden'
        : '';
  } else {
    document.body.style.overflow = '';
  }

  if (!navSections) return;

  if (isDesktop.matches) {
    setupDropdowns(
      navSections,
    );
  } else {
    cleanupDropdowns(
      navSections,
    );

    if (!expanded) {
      closeAllDropdowns(
        navSections,
      );
    }
  }
}


/* =========================================================
   ESCAPE
========================================================= */

function handleEscape(event) {
  if (event.code !== 'Escape') return;

  const nav =
    document.getElementById(
      'nav',
    );

  if (!nav) return;

  const sections =
    nav.querySelector(
      '.nav-sections',
    );

  if (isDesktop.matches) {
    const expanded =
      sections?.querySelector(
        '.nav-drop[aria-expanded="true"]',
      );

    if (expanded) {
      toggleDropdown(
        expanded,
        false,
      );

      expanded
        .querySelector(
          ':scope > a',
        )
        ?.focus();
    }

    return;
  }

  if (
    nav.getAttribute(
      'aria-expanded',
    ) === 'true'
  ) {
    toggleMenu(
      nav,
      sections,
      false,
    );

    nav.querySelector(
      '.nav-hamburger button',
    )?.focus();
  }
}


/* =========================================================
   FOCUS OUT
========================================================= */

function handleFocusOut(event) {
  const nav =
    event.currentTarget;

  if (
    nav.contains(
      event.relatedTarget,
    )
  ) {
    return;
  }

  const sections =
    nav.querySelector(
      '.nav-sections',
    );

  if (isDesktop.matches) {
    closeAllDropdowns(
      sections,
    );
  }
}


/* =========================================================
   CREATE NAV CONTENT
========================================================= */

function createNavContent(
  nav,
) {
  const section =
    nav.querySelector(
      '.section',
    );

  if (!section) {
    return null;
  }

  const navContent =
    document.createElement('div');

  navContent.className =
    'nav-content';

  const brandWrapper =
    section.querySelector(
      ':scope > .brand-wrapper',
    );

  const sectionsWrapper =
    section.querySelector(
      ':scope > .sections-wrapper',
    );

  const toolsWrapper =
    section.querySelector(
      ':scope > .tools-wrapper',
    );

  if (brandWrapper) {
    navContent.append(
      brandWrapper,
    );
  }

  if (sectionsWrapper) {
    navContent.append(
      sectionsWrapper,
    );
  }

  if (toolsWrapper) {
    navContent.append(
      toolsWrapper,
    );
  }

  section.replaceWith(
    navContent,
  );

  return navContent;
}


/* =========================================================
   NORMALIZE FRAGMENT
========================================================= */

function normalizeFragment(nav) {
  const brand =
    nav.querySelector(
      '.brand-wrapper .brand',
    );

  const sections =
    nav.querySelector(
      '.sections-wrapper .sections',
    );

  const tools =
    nav.querySelector(
      '.tools-wrapper .tools',
    );

  if (brand) {
    brand.classList.add(
      'nav-brand',
    );
  }

  if (sections) {
    sections.classList.add(
      'nav-sections',
    );
  }

  if (tools) {
    tools.classList.add(
      'nav-tools',
    );
  }

  return {
    brand,
    sections,
    tools,
  };
}


/* =========================================================
   BREAKPOINT
========================================================= */

function handleBreakpoint(
  nav,
  sections,
) {
  closeAllDropdowns(
    sections,
  );

  nav.setAttribute(
    'aria-expanded',
    'false',
  );

  const button =
    nav.querySelector(
      '.nav-hamburger button',
    );

  if (button) {
    button.setAttribute(
      'aria-expanded',
      'false',
    );

    button.setAttribute(
      'aria-label',
      'Open navigation',
    );
  }

  document.body.style.overflow = '';

  toggleMenu(
    nav,
    sections,
    false,
  );
}


/* =========================================================
   DECORATE
========================================================= */

export default async function decorate(
  block,
) {
  /*
   * -----------------------------------------
   * Load /nav fragment
   * -----------------------------------------
   */

  const navMeta =
    getMetadata('nav');

  const navPath =
    navMeta
      ? new URL(
          navMeta,
          window.location,
        ).pathname
      : '/nav';

  const fragment =
    await loadFragment(
      navPath,
    );

  if (!fragment) {
    console.error(
      'Header: Unable to load nav fragment',
    );

    return;
  }

  /*
   * -----------------------------------------
   * Clear header block
   * -----------------------------------------
   */

  block.replaceChildren();

  /*
   * -----------------------------------------
   * Create nav
   * -----------------------------------------
   */

  const nav =
    document.createElement('nav');

  nav.id = 'nav';
  nav.className = 'nav';

  /*
   * Move fragment content
   */

  while (
    fragment.firstElementChild
  ) {
    nav.append(
      fragment.firstElementChild,
    );
  }

  /*
   * -----------------------------------------
   * Normalize fragment
   * -----------------------------------------
   */

  const {
    brand,
    sections,
    tools,
  } =
    normalizeFragment(nav);

  /*
   * -----------------------------------------
   * Create nav-content
   * -----------------------------------------
   */

  createNavContent(nav);

  /*
   * -----------------------------------------
   * Setup brand
   * -----------------------------------------
   */

  setupBrand(brand);

  /*
   * -----------------------------------------
   * Setup sections
   * -----------------------------------------
   */

  setupSections(sections);

  /*
   * -----------------------------------------
   * Setup tools
   * -----------------------------------------
   */

  setupTools(tools);

  /*
   * -----------------------------------------
   * Setup dropdowns
   * -----------------------------------------
   */

  setupDropdowns(sections);

  /*
   * -----------------------------------------
   * Hamburger
   * -----------------------------------------
   */

  createHamburger(
    nav,
    sections,
  );

  /*
   * -----------------------------------------
   * Initial state
   * -----------------------------------------
   */

  nav.setAttribute(
    'aria-expanded',
    'false',
  );

  toggleMenu(
    nav,
    sections,
    false,
  );

  /*
   * -----------------------------------------
   * Events
   * -----------------------------------------
   */

  window.addEventListener(
    'keydown',
    handleEscape,
  );

  nav.addEventListener(
    'focusout',
    handleFocusOut,
  );

  /*
   * -----------------------------------------
   * Responsive breakpoint
   * -----------------------------------------
   */

  isDesktop.addEventListener(
    'change',
    () => {
      handleBreakpoint(
        nav,
        sections,
      );
    },
  );

  /*
   * -----------------------------------------
   * Wrapper
   * -----------------------------------------
   */

  const wrapper =
    document.createElement('div');

  wrapper.className =
    'nav-wrapper';

  wrapper.append(nav);

  block.append(wrapper);
}