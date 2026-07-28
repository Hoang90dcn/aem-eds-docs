export default function decorate(block) {
  const data = {};

  [...block.children].forEach((row) => {
    const key = row.children[0].textContent.trim();
    const value = row.children[1].textContent.trim();

    data[key] = value;
  });

  block.innerHTML = `
    <div class="cards-promotion__wrapper">
      <img
        class="cards-promotion__image"
        src="${data.image}"
        alt="${data.title}"
      />

      <div class="cards-promotion__content">
        <h2 class="cards-promotion__title">
          ${data.title}
        </h2>

        <a
          class="cards-promotion__button"
          href="${data.buttonLink}"
        >
          ${data.buttonText}
        </a>
      </div>
    </div>
  `;
}
