import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { isLoggedIn, getUserName, logout } from '../../common/auth/authHelper.js';

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

/*
 * The submenu can be authored two ways:
 *
 *   a) label as text, submenu as a bullet list under it
 *      <div><p>Products</p><ul>…</ul></div>
 *
 *   b) label as a bullet with nested bullets
 *      <div><ul><li>Products<ul>…</ul></li></ul></div>
 *
 * Both end up as one list of children for the item.
 */
function getSubmenu(content) {
  const outer = content.querySelector(':scope > ul');

  if (!outer) return null;

  /*
   * Shape b: a single bullet wrapping the real submenu.
   */
  if (content.children.length === 1 && outer.children.length === 1) {
    const inner = outer.children[0].querySelector(':scope > ul');

    if (inner) return inner;
  }

  return outer;
}

/*
 * An entry authored without a link is a bare text node, which
 * has nothing to hang padding on. Wrap it so links and plain
 * labels can share one rule.
 */
function wrapItemLabel(item) {
  if (item.querySelector(':scope > a, :scope > .nav-drop-label')) return;

  const label = document.createElement('span');

  label.className = 'nav-drop-label';

  [...item.childNodes]
    .filter((node) => node.nodeName !== 'UL')
    .forEach((node) => label.append(node));

  if (!label.textContent.trim()) return;

  item.prepend(label);
}

/*
 * A submenu whose items have their own lists is a mega menu
 * laid out in columns. A flat one is a plain dropdown.
 */
function decorateSubmenu(item, submenu) {
  submenu.querySelectorAll('li').forEach(wrapItemLabel);

  const hasGroups = !!submenu.querySelector(':scope > li > ul');

  item.classList.add('nav-drop');

  item.classList.add(hasGroups ? 'nav-drop-mega' : 'nav-drop-simple');

  item.setAttribute('aria-expanded', 'false');

  item.append(submenu);
}

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
    const content = row.querySelector(':scope > div') || row;

    /*
     * Detach the submenu before reading the label, otherwise
     * querySelector('a') would pick the first child link and
     * the top level item would inherit its text and href.
     */
    const nestedList = getSubmenu(content);

    if (nestedList) nestedList.remove();

    const link = content.querySelector('a');

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

    li.append(anchor);

    if (nestedList) {
      decorateSubmenu(li, nestedList);
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
   ACCOUNT MENU
========================================================= */

/*
 * Hard-coded sub menu shown when hovering
 * the account icon (same as DEMO.com "MyLG").
 *
 * Two variants, picked by the login state.
 */
const ACCOUNT_MENU_GUEST = [
  {
    label: 'Đăng nhập / Đăng ký',
    href: '/vn/login',
  },
  {
    label: 'Đăng ký sản phẩm',
    href: '/vn/dang-ky-san-pham',
  },
  {
    label: 'Quyền lợi thành viên',
    href: '/vn/quyen-loi-thanh-vien',
  },
];

const ACCOUNT_MENU_MEMBER = [
  {
    label: 'DEMO của tôi',
    href: '/vn/my-lg',
  },
  {
    label: 'Tài khoản của tôi',
    href: '/vn/tai-khoan-cua-toi',
  },
  {
    label: 'Đơn hàng của tôi',
    href: '/vn/don-hang-cua-toi',
  },
  {
    label: 'Đăng ký sản phẩm',
    href: '/vn/dang-ky-san-pham',
  },
  {
    label: 'Quyền lợi thành viên',
    href: '/vn/quyen-loi-thanh-vien',
  },
  {
    label: 'Đăng xuất',
    action: 'logout',
  },
];

const ACCOUNT_SELECTOR = '.nav-tool-account, .nav-tool-my, .nav-tool-mylg, .nav-tool-user';

const ACCOUNT_LABEL = /account|tài khoản|tai khoan|mylg/i;

function findAccountLink(navTools) {
  if (!navTools) return null;

  const direct = navTools.querySelector(ACCOUNT_SELECTOR);

  if (direct) return direct;

  /*
   * Fallback when the icon column in the
   * document uses a different name.
   */
  const links = [...navTools.querySelectorAll('.nav-tool-link')];

  const match = links.find((link) => {
    const label = link.getAttribute('aria-label') || '';

    return ACCOUNT_LABEL.test(label);
  });

  return match || null;
}

function setAccountMenuState(account, expanded) {
  if (!account) return;

  account.dataset.open = expanded ? 'true' : 'false';

  const trigger = account.querySelector('.nav-tool-link');

  trigger?.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

function closeAccountMenus(root) {
  if (!root) return;

  const open = root.querySelectorAll('.nav-account[data-open="true"]');

  open.forEach((account) => {
    setAccountMenuState(account, false);
  });
}

/*
 * "Hoang Nguyen" -> "***** Nguyen"
 *
 * Everything but the last word is masked,
 * the same way DEMO.com greets a member.
 */
function maskUserName(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length < 2) return parts.join('');

  const last = parts.pop();

  const masked = parts.map((part) => '*'.repeat(part.length)).join(' ');

  return `${masked} ${last}`;
}

function createGreeting() {
  const name = maskUserName(getUserName());

  const greeting = document.createElement('p');

  greeting.className = 'nav-account-greeting';

  greeting.textContent = name ? `Chào mừng bạn! ${name}` : 'Chào mừng bạn!';

  return greeting;
}

function createLogoutButton(label) {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'nav-account-link nav-account-logout';
  button.textContent = label;

  button.addEventListener('click', () => {
    logout();

    window.location.reload();
  });

  return button;
}

function createMenuLink(item) {
  const link = document.createElement('a');

  link.className = 'nav-account-link';
  link.href = item.href;
  link.textContent = item.label;

  return link;
}

function createAccountPanel() {
  const loggedIn = isLoggedIn();

  const panel = document.createElement('div');

  panel.className = 'nav-account-panel';

  const card = document.createElement('div');

  card.className = 'nav-account-card';

  if (loggedIn) {
    card.append(createGreeting());
  }

  const list = document.createElement('ul');

  list.className = 'nav-account-list';

  const items = loggedIn ? ACCOUNT_MENU_MEMBER : ACCOUNT_MENU_GUEST;

  items.forEach((item) => {
    const li = document.createElement('li');

    if (item.action === 'logout') {
      li.append(createLogoutButton(item.label));
    } else {
      li.append(createMenuLink(item));
    }

    list.append(li);
  });

  card.append(list);

  panel.append(card);

  return panel;
}

function setupAccountMenu(navTools) {
  const trigger = findAccountLink(navTools);

  if (!trigger) return;

  const account = trigger.parentElement;

  if (!account) return;

  if (account.dataset.accountDecorated === 'true') return;

  account.classList.add('nav-account');

  account.dataset.accountDecorated = 'true';

  trigger.setAttribute('aria-haspopup', 'true');

  account.append(createAccountPanel());

  setAccountMenuState(account, false);

  /*
   * Desktop: open on hover
   */
  account.addEventListener('mouseenter', () => {
    if (!isDesktop.matches) return;

    setAccountMenuState(account, true);
  });

  account.addEventListener('mouseleave', () => {
    if (!isDesktop.matches) return;

    setAccountMenuState(account, false);
  });

  /*
   * Keyboard
   */
  account.addEventListener('focusin', () => {
    setAccountMenuState(account, true);
  });

  account.addEventListener('focusout', (event) => {
    if (account.contains(event.relatedTarget)) return;

    setAccountMenuState(account, false);
  });

  /*
   * Touch / mobile: toggle on tap
   */
  trigger.addEventListener('click', (event) => {
    if (isDesktop.matches) return;

    event.preventDefault();

    setAccountMenuState(account, account.dataset.open !== 'true');
  });
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

function handleDropdownEnter(event) {
  if (!isDesktop.matches) return;

  toggleDropdown(event.currentTarget, true);
}

function handleDropdownLeave(event) {
  if (!isDesktop.matches) return;

  toggleDropdown(event.currentTarget, false);
}

/*
 * Tabbing onto the label opens the panel, the keyboard
 * equivalent of hovering.
 */
function handleDropdownFocusIn(event) {
  if (!isDesktop.matches) return;

  toggleDropdown(event.currentTarget, true);
}

function handleDropdownFocusOut(event) {
  if (!isDesktop.matches) return;

  const item = event.currentTarget;

  if (item.contains(event.relatedTarget)) return;

  toggleDropdown(item, false);
}

function handleDropdownClick(event) {
  const item =
    event.currentTarget;

  const link = event.target.closest('a');

  /*
   * Only the item's own label reacts, links inside the
   * submenu have to navigate as usual.
   */
  if (!link || link.parentElement !== item) return;

  /*
   * Desktop already opens on hover. Swallow the click only
   * when the label has nowhere to go, so a real href still
   * works as a landing page link.
   */
  if (isDesktop.matches) {
    const href = link.getAttribute('href');

    if (!href || href === '#') event.preventDefault();

    return;
  }

  event.preventDefault();

  toggleDropdown(item);
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

    /*
     * Only needed when the markup arrived already decorated.
     */
    if (
      !item.classList.contains('nav-drop-mega') &&
      !item.classList.contains('nav-drop-simple')
    ) {
      const hasGroups = !!submenu.querySelector(':scope > li > ul');

      item.classList.add(hasGroups ? 'nav-drop-mega' : 'nav-drop-simple');
    }

    item.setAttribute(
      'aria-expanded',
      'false',
    );

    /*
     * Attached once and guarded by breakpoint inside each
     * handler, so switching between hover and tap needs no
     * rebinding.
     */
    const events = [
      ['click', handleDropdownClick],
      ['mouseenter', handleDropdownEnter],
      ['mouseleave', handleDropdownLeave],
      ['focusin', handleDropdownFocusIn],
      ['focusout', handleDropdownFocusOut],
    ];

    events.forEach(([type, handler]) => {
      item.removeEventListener(type, handler);

      item.addEventListener(type, handler);
    });
  });
}

function cleanupDropdowns(navSections) {
  if (!navSections) return;

  const items =
    navSections.querySelectorAll(
      ':scope > ul > li.nav-drop',
    );

  /*
   * Listeners stay attached and decide per breakpoint, so
   * this only has to drop desktop-only state.
   */
  items.forEach((item) => {
    item.removeAttribute(
      'tabindex',
    );

    item.setAttribute(
      'aria-expanded',
      'false',
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

  /*
   * Account menu takes priority
   */
  const openAccount =
    nav.querySelector(
      '.nav-account[data-open="true"]',
    );

  if (openAccount) {
    setAccountMenuState(
      openAccount,
      false,
    );

    openAccount
      .querySelector('.nav-tool-link')
      ?.focus();

    return;
  }

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

  closeAccountMenus(nav);

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
   * Setup account menu
   * -----------------------------------------
   */

  setupAccountMenu(tools);

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