import { getCookie, deleteCookie, COOKIE_NAME } from '../cookieHelper.js';

export function getUserName() {
  return getCookie(COOKIE_NAME.USER_NAME) || '';
}

export function logout() {
  deleteCookie(COOKIE_NAME.ACCESS_TOKEN);
  deleteCookie(COOKIE_NAME.REFRESH_TOKEN);
  deleteCookie(COOKIE_NAME.USER_NAME);
}

export function isLoggedIn() {
  const accessToken =
    getCookie(COOKIE_NAME.ACCESS_TOKEN);
  console.log('Access Token:', accessToken);

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