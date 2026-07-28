export default function decorate(block) {
  const rows = [...block.children];

  // Remove header row
  rows.shift();

  const cards = rows.map((row) => {
    const cols = [...row.children];

    const image = cols[0]?.innerHTML || "";
    const title = cols[1]?.textContent.trim() || "";
    const buttonText = cols[2]?.textContent.trim() || "";
    const buttonLink = cols[3]?.textContent.trim() || "#";

    return `
      <article class="promotion-card">
        <div class="promotion-card__image">
          ${image}
        </div>

        <div class="promotion-card__content">
          <h3>${title}</h3>

          <a
            class="promotion-card__button"
            href="${buttonLink}"
          >
            ${buttonText}
          </a>
        </div>
      </article>
    `;
  });

  block.innerHTML = `
    <div class="promotion-grid">
      ${cards.join("")}
    </div>
  `;
}
