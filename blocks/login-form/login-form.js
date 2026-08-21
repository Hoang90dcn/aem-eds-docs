import {getCookie, setCookie,COOKIE_NAME ,  fakeLoginApi} from '../../common/cookieHelper.js';
export default function decorate(block) {
  const rows = [...block.children];

 const getValue = (index) => {
  const row = rows[index];
  return row?.children[1]?.textContent?.trim() || '';
};

  const title = getValue(0) || 'Đăng nhập hoặc tham gia với chúng tôi bằng email.';
  const emailLabel = getValue(1) || 'Địa chỉ email';
  const continueText = getValue(2) || 'Tiếp tục';
  const rememberText = getValue(3) || 'Ghi nhớ email';
  const registerText = getValue(4)
    || 'Trở thành thành viên của LG.com và tận hưởng ưu đãi 5% cho đơn hàng đầu tiên';
  const registerTextLink = getValue(5) || 'Đăng ký';

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
        <div class="login-form__field">

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
            <span>♢</span>
          </div>

          <div class="login-form__register-content">

            <span>
              ${registerText}
            </span>

            <a href="#">
              ${registerTextLink}
            </a>

          </div>

        </div>

        <div class="login-form__divider">
          <span>hoặc</span>
        </div>

        <div class="login-form__social">

          <button
            type="button"
            class="login-form__social-button login-form__social-button--apple"
            aria-label="Đăng nhập bằng Apple"
          >
            <span class="social-icon">●</span>
          </button>

          <button
            type="button"
            class="login-form__social-button"
            aria-label="Đăng nhập bằng Google"
          >
            <span class="social-icon">G</span>
          </button>

          <button
            type="button"
            class="login-form__social-button"
            aria-label="Đăng nhập bằng Facebook"
          >
            <span class="social-icon">f</span>
          </button>

        </div>

      </form>

    </div>

    <div class="login-form__footer">

      <a href="#">
        Điều khoản sử dụng dịch vụ LGE
      </a>

      <a href="#">
        Chính sách riêng tư
      </a>

      <a href="#">
        Chính sách cookie
      </a>

      <a href="#">
        Chính sách mua hàng và đổi trả
      </a>

    </div>
  `;

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
            window.location.href = '/vn/';
        }
      });
  });
}