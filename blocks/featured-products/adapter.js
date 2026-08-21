/**
 * Product Adapter
 *
 * Normalize API response
 * => UI Model
 */

function normalizeBadge(product) {
  const badges = [];

  if (product.badge) {
    badges.push(product.badge);
  }

  if (Array.isArray(product.badges)) {
    badges.push(...product.badges);
  }

  if (product.discountText) {
    badges.push(product.discountText);
  }

  return badges;
}

function normalizePrice(value) {
  if (value == null || value === '') {
    return null;
  }

  return Number(String(value).replace(/[^\d]/g, ''));
}

function normalizeProduct(product) {
  return {
    sku:
      product.sku ||
      product.modelCode ||
      product.model_id ||
      '',

    name:
      product.name ||
      product.productName ||
      product.prdName ||
      '',

    url:
      product.url ||
      product.pdpUrl ||
      product.productUrl ||
      '#',

    image:
      product.image ||
      product.imageUrl ||
      product.thumbnail ||
      product.thumbnailUrl ||
      '',

    badges: normalizeBadge(product),

    rating:
      Number(product.rating) ||
      Number(product.reviewScore) ||
      0,

    reviewCount:
      Number(product.reviewCount) ||
      Number(product.reviewCnt) ||
      0,

    price: normalizePrice(
      product.price ??
      product.salePrice ??
      product.finalPrice
    ),

    originalPrice: normalizePrice(
      product.originalPrice ??
      product.listPrice ??
      product.normalPrice
    ),

    memberPrice: normalizePrice(
      product.memberPrice ??
      product.vipPrice
    ),

    installment:
      product.installment ||
      product.monthlyPrice ||
      null,

    stock:
      product.stock ??
      product.inventory ??
      0,

    currency:
      product.currency ||
      "VND",

    locale:
      product.locale ||
      "vi-VN"
  };
}

/**
 * API Response
 * =>
 * UI Response
 */
export function adaptResponse(response) {

  const tabs = response.tabs || response.data || [];

  return {

    tabs: tabs.map((tab) => ({

      title:
        tab.title ||
        tab.tabTitle,

      products:
        (tab.products || []).map(normalizeProduct)

    }))

  };

}