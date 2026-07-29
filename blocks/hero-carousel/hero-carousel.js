export default function decorate(block) {
  const rows = [...block.children];

  if (rows.length <= 1) return;

  // Remove header row
  rows.shift();

  const slides = rows.map((row) => {
    const cells = [...row.children];

    return {
      image: cells[0]?.innerHTML || '',
      date: cells[1]?.textContent.trim() || '',
      title: cells[2]?.textContent.trim() || '',
      description: cells[3]?.textContent.trim() || '',
      button: cells[4]?.textContent.trim() || '',
        link: cells[5]?.querySelector('a')?.href || '#',
      align: cells[8]?.textContent.trim().toLowerCase() || 'right'
    };
  });

  block.innerHTML = `
    <div class="hero-carousel">

      <div class="hero-track">

        ${slides
          .map(
            (slide) => `
          <div class="hero-slide">

              <div class="hero-background">
                  ${slide.image}
              </div>

              <div class="hero-overlay"></div>

              <div class="hero-content hero-${slide.align}">

                  <span class="hero-date">
                      ${slide.date}
                  </span>

                  <h3>
                      ${slide.title}
                  </h3>

                  <p>
                      ${slide.description}
                  </p>

                  <a href="${slide.link}" class="hero-btn">
                      ${slide.button}
                  </a>

              </div>

          </div>
        `,
          )
          .join('')}

      </div>

      <button class="hero-prev">
          &#10094;
      </button>

      <button class="hero-next">
          &#10095;
      </button>

      <div class="hero-pagination"></div>

    </div>
  `;

  const track = block.querySelector('.hero-track');
  const slideElements = [...block.querySelectorAll('.hero-slide')];
  const pagination = block.querySelector('.hero-pagination');

  let current = 0;
  let timer;

  slideElements.forEach((_, index) => {
    const dot = document.createElement('button');

    dot.className = 'hero-dot';

    dot.addEventListener('click', () => {
      current = index;
      update();
      restart();
    });

    pagination.append(dot);
  });

  const dots = [...pagination.children];

  function update() {
    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', current === index);
    });
  }

  function next() {
    current++;

    if (current >= slideElements.length) {
      current = 0;
    }

    update();
  }

  function prev() {
    current--;

    if (current < 0) {
      current = slideElements.length - 1;
    }

    update();
  }

  function autoplay() {
    timer = setInterval(next, 5000);
  }

  function restart() {
    clearInterval(timer);
    autoplay();
  }

  block.querySelector('.hero-next').addEventListener('click', () => {
    next();
    restart();
  });

  block.querySelector('.hero-prev').addEventListener('click', () => {
    prev();
    restart();
  });

  // Swipe

  let startX = 0;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  track.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;

    if (diff > 60) {
      next();
      restart();
    }

    if (diff < -60) {
      prev();
      restart();
    }
  });

  block.addEventListener('mouseenter', () => {
    clearInterval(timer);
  });

  block.addEventListener('mouseleave', () => {
    autoplay();
  });

  update();

  autoplay();
}