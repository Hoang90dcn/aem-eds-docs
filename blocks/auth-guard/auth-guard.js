import { isLoggedIn } from '../../common/auth/authHelper.js';

export default function decorate(block) {
    if (isLoggedIn()) {
      console.log('User is not logged in. Redirecting to login.');
    block.remove();
    return;
  }

  const currentUrl  =
    `${window.location.pathname}${window.location.search}`;

  window.location.replace(
    `/vn/login?redirect=${encodeURIComponent(currentUrl)}`,
  );
}