import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function decorate(block) {
  const rows = [...block.children];

  const swiper = document.createElement('div');
  swiper.className = 'swiper hero-carousel-swiper';

  const wrapper = document.createElement('div');
  wrapper.className = 'swiper-wrapper';

  rows.forEach((row) => {
    const cells = [...row.children];

    const [
      image,
      date,
      title,
      description,
      buttonText,
      buttonLink,
    ] = cells;

    const slide = document.createElement('div');
    slide.className = 'swiper-slide';

    slide.innerHTML = `
      <div class="hero-slide">

        <div class="hero-slide__image">
          ${image?.innerHTML || ''}
        </div>

        <div class="hero-slide__content">

          <span class="hero-slide__date">
            ${date?.textContent || ''}
          </span>

          <h2 class="hero-slide__title">
            ${title?.textContent || ''}
          </h2>

          <p class="hero-slide__description">
            ${description?.textContent || ''}
          </p>

          ${
            buttonLink?.querySelector('a')
              ? `
                <a
                  class="hero-slide__button"
                  href="${buttonLink.querySelector('a').href}"
                >
                  ${buttonText?.textContent || 'Learn more'}
                </a>
              `
              : ''
          }

        </div>

      </div>
    `;

    wrapper.append(slide);
  });

  swiper.append(wrapper);

  swiper.insertAdjacentHTML(
    'beforeend',
    `
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
      <div class="swiper-pagination"></div>
    `,
  );

  block.textContent = '';
  block.append(swiper);

  new Swiper(swiper, {
    modules: [Navigation, Pagination, Autoplay],

    loop: true,

    speed: 800,

    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  });
}