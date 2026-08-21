/**
 * Generic Carousel
 */

export function createCarousel({
  container,
  items = [],
  renderItem,
  slidesPerView = 4,
}) {
  let currentIndex = 0;

  const root = document.createElement('div');
  root.className = 'fp-carousel';

  const viewport = document.createElement('div');
  viewport.className = 'fp-carousel__viewport';

  const track = document.createElement('div');
  track.className = 'fp-carousel__track';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'fp-carousel__prev';
  prevBtn.type = 'button';
  prevBtn.innerHTML = '&#10094;';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'fp-carousel__next';
  nextBtn.type = 'button';
  nextBtn.innerHTML = '&#10095;';

  viewport.append(track);

  root.append(prevBtn);
  root.append(viewport);
  root.append(nextBtn);

  container.append(root);

  function getSlidesPerView() {
    if (window.innerWidth < 768) return 1;

    if (window.innerWidth < 1024) return 2;

    if (window.innerWidth < 1440) return 3;

    return slidesPerView;
  }

  function render() {
    track.innerHTML = '';

    items.forEach((item) => {
      const slide = document.createElement('div');

      slide.className = 'fp-carousel__slide';

      slide.append(renderItem(item));

      track.append(slide);
    });

    update();
  }

  function update() {
    const visible = getSlidesPerView();

    const width = 100 / visible;

    [...track.children].forEach((slide) => {
      slide.style.flexBasis = `${width}%`;
    });

    track.style.transform = `translateX(-${currentIndex * width}%)`;

    prevBtn.disabled = currentIndex === 0;

    nextBtn.disabled =
      currentIndex >= items.length - visible;
  }

  function next() {
    const visible = getSlidesPerView();

    if (currentIndex >= items.length - visible) return;

    currentIndex++;

    update();
  }

  function prev() {
    if (currentIndex <= 0) return;

    currentIndex--;

    update();
  }

  prevBtn.addEventListener('click', prev);

  nextBtn.addEventListener('click', next);

  window.addEventListener('resize', update);

  render();

  return {

    next,

    prev,

    updateItems(newItems) {
      items = newItems;

      currentIndex = 0;

      render();
    },

    destroy() {
      window.removeEventListener('resize', update);

      root.remove();
    },

  };
}