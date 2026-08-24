// Default configuration + reference data seeded into localStorage.
// All values editable by the user in the Configuration / Suppliers / Products tabs.

export const CURRENCIES = ["INR", "CNY", "ZAR"];

export const QTY_UNITS = ["roll", "meter", "pcs"];

export const PRICE_BASIS = [
  { id: "per_meter", label: "Per meter" },
  { id: "per_roll", label: "Per roll" },
];

// Flat per-kg shipping methods (no weight tiers).
export const SHIPPING_METHODS = ["Air Safe", "Air+", "Ship"];

export const ROUTES = [
  { id: "india-sa", name: "India → South Africa", source: "India", sourceLetter: "I", currency: "INR" },
  { id: "china-sa", name: "China → South Africa", source: "China", sourceLetter: "C", currency: "CNY" },
];

export const DEFAULT_CONFIG = {
  version: 2,

  categories: [
    { id: "trims", name: "Trims", abbr: "TR", subCategories: ["Ribbon", "Elastic", "Buttons"] },
    { id: "lace", name: "Lace", abbr: "LC", subCategories: ["Cotton Lace", "Net Lace"] },
    { id: "habby", name: "Habby Items", abbr: "HB", subCategories: [] },
    { id: "fabrics", name: "Fabrics", abbr: "FB", subCategories: ["Cotton", "Polyester", "Denim"] },
  ],

  // shippingRates[routeId][method] = rate PER KG in the route's SOURCE currency.
  // Converted to ZAR at calculation time using currencyRates.
  shippingRates: {
    "india-sa": { "Air Safe": 800, "Air+": 650, Ship: 60 },
    "china-sa": { "Air Safe": 90, "Air+": 75, Ship: 8 },
  },

  // 1 unit of currency = ? ZAR. ZAR is the base (1).
  currencyRates: { INR: 0.21, CNY: 2.55, ZAR: 1 },

  dutyRate: 15, // % applied when duty is enabled on a calculation (else 0%)
  handlingFeeRate: 5, // % of product cost
  handlingFeeFlat: 150, // flat ZAR per roll
  taxRate: 15, // VAT % on subtotal

  // Cost tier indicator for the generated supplier code, by cost per meter (ZAR).
  costTiers: [
    { id: 1, label: "Low", max: 50 },
    { id: 2, label: "Mid", max: 150 },
    { id: 3, label: "High", max: null },
  ],

  // Custom rules by category + route ("any" wildcard allowed).
  customRules: [
    {
      id: "rule-fragile-lace",
      name: "Fragile Lace surcharge",
      category: "lace",
      routeId: "any",
      adjustType: "percent",
      value: 3,
    },
  ],
};

export const DEFAULT_SUPPLIERS = [
  { id: "sup-mumbai", name: "Mumbai Textiles", code: "MT-01", routeId: "india-sa", currency: "INR" },
  { id: "sup-shanghai", name: "Shanghai Silk Co", code: "SS-07", routeId: "china-sa", currency: "CNY" },
];

export const DEFAULT_PRODUCTS = [
  { id: "prod-lace-1", name: "Cotton Lace 5cm", category: "lace", subCategory: "Cotton Lace", currency: "INR", priceBasis: "per_meter", price: 22, metersInRoll: 9 },
  { id: "prod-ribbon-1", name: "Satin Ribbon 25mm", category: "trims", subCategory: "Ribbon", currency: "CNY", priceBasis: "per_roll", price: 45, metersInRoll: 100 },
];

export const STORAGE_KEYS = {
  config: "ipc.config.v2",
  history: "ipc.history.v1",
  suppliers: "ipc.suppliers.v1",
  products: "ipc.products.v1",
};
