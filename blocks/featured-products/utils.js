/**
 * Utils
 */

export function formatCurrency(
  value,
  locale = "vi-VN",
  currency = "VND"
) {
  if (value == null || value === "") return "";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function createElement(
  tag,
  className,
  html = ""
) {
  const el = document.createElement(tag);

  if (className) {
    el.className = className;
  }

  el.innerHTML = html;

  return el;
}

export function createImage(
  src,
  alt = ""
) {
  const img = document.createElement("img");

  img.loading = "lazy";

  img.decoding = "async";

  img.src = src;

  img.alt = alt;

  return img;
}

export function debounce(fn, wait = 200) {
  let timer;

  return (...args) => {

    clearTimeout(timer);

    timer = setTimeout(() => {

      fn(...args);

    }, wait);

  };
}

export function throttle(fn, delay = 100) {

  let waiting = false;

  return (...args) => {

    if (waiting) return;

    waiting = true;

    fn(...args);

    setTimeout(() => {

      waiting = false;

    }, delay);

  };
}

export function unique(array = []) {

  return [...new Set(array)];

}

export function clamp(value, min, max) {

  return Math.max(min, Math.min(value, max));

}

export function isMobile() {

  return window.innerWidth < 768;

}

export function isTablet() {

  return window.innerWidth < 1024;

}

export function getSlidesPerView(config = {}) {

  if (window.innerWidth < 768) {

    return config.mobile || 1;

  }

  if (window.innerWidth < 1024) {

    return config.tablet || 2;

  }

  return config.desktop || 4;

}