/*
 * Fixture used until a real product API is wired up.
 *
 * Gallery images are inline SVG placeholders so the repo stays
 * self contained. Swap `gallery` for real asset URLs when the
 * product feed is available.
 */

function placeholder(index, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1b1b2f" />
        <stop offset="50%" stop-color="#6a2c9c" />
        <stop offset="100%" stop-color="#0f7a8a" />
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="#f5f5f5" />
    <rect x="90" y="90" width="620" height="360" rx="6" fill="url(#g)" />
    <rect x="360" y="450" width="80" height="40" fill="#2b2b2b" />
    <rect x="290" y="490" width="220" height="12" rx="6" fill="#2b2b2b" />
    <text x="400" y="545" font-family="sans-serif" font-size="24"
      fill="#666" text-anchor="middle">${label} ${index}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const GALLERY_COUNT = 15;

export const MOCK_PRODUCT = {
  sku: 'OLED83C6ELB',
  name: '83 inch DEMO OLED evo AI C6 4K Smart TV 2026',
  badge: 'Save with PayPal',

  rating: 0,
  reviewCount: 0,

  gallery: Array.from({ length: GALLERY_COUNT }, (unused, index) => ({
    src: placeholder(index + 1, 'OLED evo C6'),
    alt: `83 inch DEMO OLED evo AI C6 4K Smart TV 2026 — view ${index + 1}`,
  })),

  keyFeatures: [
    'Hyper Radiant Colour Tech, a next-gen OLED technology for a new level of picture quality',
    'X3.2 higher peak brightness with alpha 11 AI Processor Gen3, for vivid highlights and detail',
    'Perfect Black and Perfect Colour ensures deeper contrast and vivid, accurate colour in any light',
    'Brightness Booster Ultimate concentrates light for a picture that stays punchy in bright rooms',
    'webOS Re:New Program keeps the smart platform updated for years after purchase',
  ],

  specsUrl: '#product-specs',

  promos: [
    {
      type: 'gift',
      text: 'Get 3 gifts with this product.',
      linkText: 'Select yours',
      href: '#gifts',
    },
    {
      type: 'highlight',
      text: 'Up to 20% Exclusive Discount for Students & Key Workers',
      href: '#student-discount',
    },
  ],

  /*
   * The first available variant is preselected.
   */
  variants: [
    {
      sku: 'OLED83C6ELB', label: '83"', price: 3999.98, available: true,
    },
    {
      sku: 'OLED77C6ELB', label: '77"', price: 2999.98, available: false,
    },
    {
      sku: 'OLED65C6ELB', label: '65"', price: 2199.98, available: true,
    },
    {
      sku: 'OLED55C6ELB', label: '55"', price: 1599.98, available: false,
    },
    {
      sku: 'OLED48C6ELB', label: '48"', price: 1199.98, available: false,
    },
    {
      sku: 'OLED42C6ELB', label: '42"', price: 1099.98, available: false,
    },
  ],

  bundleNote: 'Only Welcome Voucher applies with this offer. Partial return is not available.',

  bundles: [
    {
      id: 'WB21EB',
      name: 'Slim Wall Mount Bracket - WB21EB',
      price: 69.98,
    },
    {
      id: 'H7',
      name: 'Sound Suite H7: All-in-one Soundbar with 9.1.6 Spatial Sound & Dolby Atmos',
      price: 679.20,
      wasPrice: 849.00,
      saveLabel: 'Save 20%',
    },
    {
      id: 'S95TR',
      name: '9.1.5 channel DEMO Home Cinema Soundbar with Surround Sound and Rear Speakers',
      price: 649.99,
      wasPrice: 1299.99,
      saveLabel: 'Save 50%',
    },
    {
      id: 'TONE-T90S',
      name: 'DEMO TONE Free T90S Earbuds with Dolby Atmos',
      price: 149.99,
      wasPrice: 199.99,
      saveLabel: 'Save 25%',
    },
  ],

  deals: [
    {
      text: 'Pay with PayPal and save £100 on your order. The discount is automatically applied at Checkout.',
    },
  ],

  deliveryOptions: [
    {
      id: 'standard', label: 'Standard Delivery', price: 0, note: 'Delivered within 3–5 working days.',
    },
    {
      id: 'express', label: 'Express Delivery', price: 9.99, note: 'Next working day where available.',
    },
    {
      id: 'timed', label: 'Timed Delivery', price: 75, note: 'Choose a two hour slot at checkout.',
    },
  ],

  /*
   * Availability is resolved against the outward code, the part
   * of a UK postcode before the space.
   */
  availability: {
    servicedOutwardCodes: ['NG27', 'NG1', 'SW1A', 'M1', 'EH1', 'CF10', 'B1'],
    deliverableMessage: 'We can deliver to this postcode',
    notDeliverableMessage: 'Sorry, we cannot deliver this product to your postcode.',
    invalidMessage: 'Please enter a valid postcode.',
    unavailableTitle: 'This product is not available in your area',
  },

  legal: [
    'For change of mind returns, the shipping fee may not be refunded.',
    'Orders from the Scottish Islands and remote areas will be delivered by 3PL. The 3PL will contact you to arrange a suitable delivery date.',
    'Delivery fees vary by postcode and may include additional charges for Highland or remote areas. Final shipping costs will be confirmed at checkout.',
    'Further information regarding delivery can be found in our Delivery Terms and Conditions.',
  ],

  returnPolicy: { label: 'Return Policy', href: '#return-policy' },

  payments: ['visa', 'mastercard', 'amex', 'klarna', 'paypal', 'applepay', 'googlepay', 'maestro'],
};

export default MOCK_PRODUCT;
