/**
 * Create Product Card
 */

function createBadge(text) {
  if (!text) return null;

  const badge = document.createElement('span');
  badge.className = 'product-card__badge';
  badge.textContent = text;

  return badge;
}

function createPrice(label, value, className = '') {
  if (!value) return null;

  const wrapper = document.createElement('div');
  wrapper.className = `product-card__price ${className}`;

  if (label) {
    const span = document.createElement('span');
    span.className = 'product-card__price-label';
    span.textContent = label;

    wrapper.append(span);
  }

  const price = document.createElement('strong');
  price.className = 'product-card__price-value';
  price.textContent = value;

  wrapper.append(price);

  return wrapper;
}

function createRating(product) {
  const wrapper = document.createElement('div');
  wrapper.className = 'product-card__rating';

  wrapper.innerHTML = `
        ⭐ ${product.rating || 0}
        <span>(${product.reviewCount || 0})</span>
    `;

  return wrapper;
}

export function createProductCard(product) {

  const card = document.createElement('article');

  card.className = 'product-card';

  card.innerHTML = `
        <a href="${product.url}" class="product-card__image">

            <img
                src="${product.image}"
                alt="${product.name}"
                loading="lazy"
            >

        </a>

        <div class="product-card__content">

            <h3 class="product-card__name">
                ${product.name}
            </h3>

        </div>
    `;

  const content = card.querySelector(".product-card__content");

  // Badge

  if (product.badges?.length) {

      const badgeWrapper = document.createElement("div");

      badgeWrapper.className = "product-card__badges";

      product.badges.forEach((badge)=>{

          badgeWrapper.append(createBadge(badge));

      });

      content.prepend(badgeWrapper);

  }

  // Rating

  content.append(createRating(product));

  // Old Price

  const oldPrice = createPrice(
      "",
      product.originalPrice,
      "is-old"
  );

  if(oldPrice){

      content.append(oldPrice);

  }

  // Current Price

  const price = createPrice(
      "",
      product.price
  );

  if(price){

      content.append(price);

  }

  // Member Price

  const memberPrice = createPrice(
      "LG Member",
      product.memberPrice,
      "is-member"
  );

  if(memberPrice){

      content.append(memberPrice);

  }

  // Installment

  if(product.installment){

      const installment=document.createElement("div");

      installment.className="product-card__installment";

      installment.textContent=`Trả góp từ ${product.installment}`;

      content.append(installment);

  }

  // CTA

  const button=document.createElement("a");

  button.href=product.url;

  button.className="product-card__button";

  button.textContent="Mua ngay";

  content.append(button);

  return card;

}