// Default configuration seeded into localStorage on first run.
// All values are editable by the user in the Configuration tab.

export const SHIPPING_METHODS = ["Air", "Ship"];

export const ROUTES = [
  { id: "india-sa", name: "India → South Africa", source: "India", sourceLetter: "I", currency: "INR" },
  { id: "china-sa", name: "China → South Africa", source: "China", sourceLetter: "C", currency: "CNY" },
];

export const DEFAULT_CONFIG = {
  version: 1,

  categories: [
    { id: "trims", name: "Trims", abbr: "TR" },
    { id: "lace", name: "Lace", abbr: "LC" },
    { id: "habby", name: "Habby Items", abbr: "HB" },
    { id: "fabrics", name: "Fabrics", abbr: "FB" },
  ],

  // Weight tiers used to pick the shipping rate. max=null means "and above".
  weightTiers: [
    { id: "t1", label: "0 – 10 kg", min: 0, max: 10 },
    { id: "t2", label: "10 – 50 kg", min: 10, max: 50 },
    { id: "t3", label: "50 kg +", min: 50, max: null },
  ],

  // shippingRates[routeId][method][tierId] = ZAR per kg
  shippingRates: {
    "india-sa": {
      Air: { t1: 185, t2: 155, t3: 125 },
      Ship: { t1: 68, t2: 55, t3: 44 },
    },
    "china-sa": {
      Air: { t1: 205, t2: 172, t3: 140 },
      Ship: { t1: 76, t2: 62, t3: 50 },
    },
  },

  // Percentages applied on the product cost (same for every category).
  customsDutyRate: 20, // %
  handlingFeeRate: 5, // % of product cost
  handlingFeeFlat: 150, // flat ZAR fee per roll
  taxRate: 15, // VAT % applied on the subtotal

  // Cost tier indicator used in the generated supplier code.
  // Evaluated against the final cost per meter (ZAR). max=null => top tier.
  costTiers: [
    { id: 1, label: "Low", max: 50 },
    { id: 2, label: "Mid", max: 150 },
    { id: 3, label: "High", max: null },
  ],

  // Custom pricing rules layered on top of the base calc.
  // Matches on category + weight tier + route ("any" wildcards allowed).
  customRules: [
    {
      id: "rule-fragile-lace",
      name: "Fragile Lace surcharge",
      category: "lace",
      tierId: "any",
      routeId: "any",
      adjustType: "percent", // "percent" of product cost or "flat" ZAR
      value: 3,
    },
  ],

  // Reference only – app never auto-converts. User enters prices already in ZAR.
  exchangeRates: {
    inrToZar: 0.21,
    cnyToZar: 2.55,
    updatedAt: null,
  },
};

export const STORAGE_KEYS = {
  config: "ipc.config.v1",
  history: "ipc.history.v1",
};
