  export const fakeLoginApi = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          accessToken: 'fake-access-token-abc123',
          refreshToken: 'fake-refresh-token-xyz789',
        });
      }, 500);
    });
  };


  // cookie.js

export function setCookie(name, value, options = {}) {
  const {
    maxAge,
    expires,
    path = '/',
    domain,
    secure = false,
    sameSite = 'Lax',
  } = options;

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (maxAge !== undefined) {
    cookie += `; Max-Age=${maxAge}`;
  }

  if (expires) {
    cookie += `; Expires=${expires.toUTCString()}`;
  }

  if (path) {
    cookie += `; Path=${path}`;
  }

  if (domain) {
    cookie += `; Domain=${domain}`;
  }

  if (secure) {
    cookie += '; Secure';
  }

  if (sameSite) {
    cookie += `; SameSite=${sameSite}`;
  }

  document.cookie = cookie;
}

export function getCookie(name) {
  const cookies = document.cookie.split('; ');

  const cookie = cookies.find((item) => {
    return item.startsWith(`${encodeURIComponent(name)}=`);
  });

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split('=').slice(1).join('='));
}


export const COOKIE_NAME = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
}