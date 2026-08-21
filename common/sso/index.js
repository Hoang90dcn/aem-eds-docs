import { getCookie, COOKIE_NAME } from '../cookieHelper';

export function isLoggedIn() {
  const accessToken =
    getCookie(COOKIE_NAME.ACCESS_TOKEN);

  return Boolean(accessToken);
}

export function requireLogin() {
  if (isLoggedIn()) {
    return true;
  }

  const currentUrl =
    `${window.location.pathname}${window.location.search}`;

  const loginUrl =
    `/login?redirect=${encodeURIComponent(currentUrl)}`;

  window.location.href = loginUrl;

  return false;
}