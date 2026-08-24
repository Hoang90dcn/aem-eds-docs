import {getCookie, setCookie,COOKIE_NAME ,  fakeLoginApi} from '../../common/cookieHelper.js';
export default function decorate(block) {
  const rows = [...block.children];

 const getValue = (index) => {
  const row = rows[index];
  return row?.children[1]?.textContent?.trim() || '';
};

  /*
   * A value cell can hold a plain URL or a real link.
   * Return both the href and a usable label, never the
   * raw URL as visible text.
   */
  const getLink = (index, fallbackLabel) => {
    const cell = rows[index]?.children[1];
    const anchor = cell?.querySelector('a');
    const text = cell?.textContent?.trim() || '';
    const href = anchor?.getAttribute('href') || text || '#';
    const isUrl = /^(https?:\/\/|\/|#)/.test(text);

    return {
      href,
      label: !text || isUrl ? fallbackLabel : text,
    };
  };

  const title = getValue(0) || 'Đăng nhập hoặc tham gia với chúng tôi bằng email.';
  const emailLabel = getValue(1) || 'Địa chỉ email';
  const continueText = getValue(2) || 'Tiếp tục';
  const rememberText = getValue(3) || 'Ghi nhớ email';
  const registerText = getValue(4)
    || 'Trở thành thành viên của demo.com và tận hưởng ưu đãi 5% cho đơn hàng đầu tiên';
  const registerLink = getLink(5, 'Đăng ký');

  const socialLinks = {
    apple: getLink(6, 'Apple').href,
    facebook: getLink(7, 'Facebook').href,
    google: getLink(8, 'Google').href,
  };

  /*
   * Brand marks are inlined so the buttons render
   * with the LCP, no extra request per icon.
   */
  const ICONS = {
    tag: `
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path
          d="M17.6 4H7a3 3 0 0 0-3 3v10.6a3 3 0 0 0 .88 2.12l9.4 9.4a3 3 0 0 0 4.24 0l8.6-8.6a3 3 0 0 0 0-4.24l-9.4-9.4A3 3 0 0 0 17.6 4Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        />
        <circle cx="9.6" cy="9.6" r="1.7" fill="currentColor" />
        <circle cx="15" cy="16" r="1.7" fill="none" stroke="currentColor" stroke-width="1.5" />
        <circle cx="20.4" cy="21.4" r="1.7" fill="none" stroke="currentColor" stroke-width="1.5" />
        <path d="M21.4 14.6 14 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    `,
    eye: `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M2 12s3.6-6.6 10-6.6S22 12 22 12s-3.6 6.6-10 6.6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3.1" />
      </svg>
    `,
    eyeOff: `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M2 12s3.6-6.6 10-6.6S22 12 22 12s-3.6 6.6-10 6.6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3.1" />
        <path d="M3.2 20.8 20.8 3.2" />
      </svg>
    `,
    apple: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="#000"
          d="M16.37 1.43c0 1.14-.42 2.2-1.25 3.03-.9.9-2 1.42-3.08 1.33-.02-1.1.44-2.2 1.26-3.02.86-.87 2.1-1.44 3.07-1.34Zm4.53 15.67c-.5 1.15-.74 1.66-1.38 2.68-.9 1.42-2.16 3.2-3.73 3.21-1.4.01-1.76-.91-3.65-.9-1.9.01-2.29.92-3.68.9-1.57-.01-2.77-1.61-3.67-3.03-2.5-3.95-2.77-8.58-1.22-11.05 1.1-1.75 2.83-2.78 4.46-2.78 1.66 0 2.7.92 4.08.92 1.33 0 2.14-.92 4.06-.92 1.45 0 2.99.79 4.08 2.16-3.59 1.97-3.01 7.1.65 8.81Z"
        />
      </svg>
    `,
    google: `
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.97-6.19A23.94 23.94 0 0 0 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19Z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
      </svg>
    `,
    facebook: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="#1877F2"
          d="M13.5 22v-9h3l.5-3.5h-3.5V7.25c0-1 .28-1.7 1.72-1.7H17V2.4c-.32-.04-1.4-.14-2.66-.14-2.63 0-4.43 1.6-4.43 4.55V9.5H7V13h2.91v9h3.59Z"
        />
      </svg>
    `,
  };

  block.innerHTML = `
    <div class="login-form__card">

      <h1 class="login-form__title">
        ${title}
      </h1>

      <form class="login-form__form">

        <!-- Email -->
        <div class="login-form__field">

          <label
            class="login-form__label"
            for="login-email"
          >
            ${emailLabel}
            <span class="login-form__required">*</span>
          </label>

          <input
            id="login-email"
            name="email"
            type="email"
            autocomplete="email"
            class="login-form__input"
            placeholder=" "
            required
          />

        </div>

        <!-- Password -->
        <div class="login-form__field login-form__field--password">

          <label
            class="login-form__label"
            for="login-password"
          >
            Mật khẩu
            <span class="login-form__required">*</span>
          </label>

          <input
            id="login-password"
            name="password"
            type="password"
            autocomplete="current-password"
            class="login-form__input"
            placeholder=" "
            required
          />

          <button
            type="button"
            class="login-form__toggle"
            aria-controls="login-password"
            aria-pressed="false"
            aria-label="Hiện mật khẩu"
          >
            <span class="login-form__toggle-icon login-form__toggle-icon--off">
              ${ICONS.eyeOff}
            </span>
            <span class="login-form__toggle-icon login-form__toggle-icon--on">
              ${ICONS.eye}
            </span>
          </button>

        </div>

        <button
          type="submit"
          class="login-form__submit"
        >
          ${continueText}
        </button>

        <label class="login-form__remember">

          <input
            type="checkbox"
            name="remember"
          />

          <span>
            ${rememberText}
          </span>

        </label>

        <div class="login-form__register">

          <div class="login-form__register-icon">
            ${ICONS.tag}
          </div>

          <div class="login-form__register-content">

            <span>
              ${registerText}
            </span>

            <a href="${registerLink.href}">
              ${registerLink.label}
            </a>

          </div>

        </div>

        <div class="login-form__divider">
          <span>hoặc</span>
        </div>

        <div class="login-form__social">

          <a
            href="${socialLinks.apple}"
            class="login-form__social-button login-form__social-button--apple"
            aria-label="Đăng nhập bằng Apple"
          >
            <span class="social-icon">${ICONS.apple}</span>
          </a>

          <a
            href="${socialLinks.google}"
            class="login-form__social-button login-form__social-button--google"
            aria-label="Đăng nhập bằng Google"
          >
            <span class="social-icon">${ICONS.google}</span>
          </a>

          <a
            href="${socialLinks.facebook}"
            class="login-form__social-button login-form__social-button--facebook"
            aria-label="Đăng nhập bằng Facebook"
          >
            <span class="social-icon">${ICONS.facebook}</span>
          </a>

        </div>

      </form>

    </div>

    <div class="login-form__footer">

      <a href="#">
        Điều khoản sử dụng dịch vụ LGE
      </a>

      <a href="#">
        Chính sách quyền riêng tư
      </a>

      <a href="#">
        Chính sách cookie
      </a>

      <a href="#">
        Chính sách mua hàng và đổi trả
      </a>

    </div>
  `;

  /*
   * Show / hide password
   */
  const passwordInput = block.querySelector('#login-password');
  const passwordToggle = block.querySelector('.login-form__toggle');

  passwordToggle.addEventListener('click', () => {
    const isVisible = passwordInput.type === 'text';

    const { selectionStart, selectionEnd } = passwordInput;

    passwordInput.type = isVisible ? 'password' : 'text';

    passwordToggle.setAttribute('aria-pressed', isVisible ? 'false' : 'true');

    passwordToggle.setAttribute(
      'aria-label',
      isVisible ? 'Hiện mật khẩu' : 'Ẩn mật khẩu',
    );

    /*
     * Swapping the type drops the caret, put it back
     * so typing can continue where it left off.
     */
    passwordInput.focus();
    passwordInput.setSelectionRange(selectionStart, selectionEnd);
  });

  const form = block.querySelector('.login-form__form');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = block
      .querySelector('#login-email')
      .value
      .trim();

    const password = block
      .querySelector('#login-password')
      .value;

    if (!email || !password) {
      return;
    }

    if (!email.includes('@')) {
      return;
    }

    console.log('Login email:', email);
    console.log('Login password:', password);

    // TODO:
    // call authentication API
    fakeLoginApi()
      .then((response) => {
          if (response.success) {
            console.log('Login successful. Access token:', response.accessToken);
            setCookie(COOKIE_NAME.ACCESS_TOKEN, response.accessToken);
            setCookie(COOKIE_NAME.REFRESH_TOKEN, response.refreshToken);
            setCookie(COOKIE_NAME.USER_NAME, response.userName || '');
            window.location.href = '/vn/';
        }
      });
  });
}