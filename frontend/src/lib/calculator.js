import { ROUTES } from "@/lib/defaults";

// ---------------------------------------------------------------------------
// Import Landed Cost calculation engine.
// Pure, dependency-free. Accepts an input + config and returns a full
// breakdown. Handles multi-currency (auto-converts to ZAR), per-meter/per-roll
// buying price, flat per-kg shipping (no weight tiers) and an optional duty.
// ---------------------------------------------------------------------------

const num = (v) => {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : NaN;
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export function getRouteMeta(routeId) {
  return ROUTES.find((r) => r.id === routeId) || null;
}

export function toZar(amount, currency, currencyRates = {}) {
  const rate = num(currencyRates?.[currency]);
  return num(amount) * (Number.isFinite(rate) ? rate : 1);
}

export function findCostTier(costPerMeter, costTiers = []) {
  if (!costTiers.length) return { id: 0, label: "N/A" };
  const c = num(costPerMeter);
  const match = costTiers.find((t) => t.max == null || c < num(t.max));
  return match || costTiers[costTiers.length - 1];
}

export function validateInput(input) {
  const errors = {};
  const requirePositive = (field, label, allowZero = false) => {
    const n = num(input[field]);
    if (input[field] === "" || input[field] == null || Number.isNaN(n)) {
      errors[field] = `${label} is required`;
    } else if (n < 0) {
      errors[field] = `${label} cannot be negative`;
    } else if (!allowZero && n === 0) {
      errors[field] = `${label} must be greater than zero`;
    }
  };

  requirePositive("buyingPrice", "Buying price", true);
  requirePositive("metersInRoll", "Meters in roll");
  requirePositive("weight", "Weight");
  requirePositive("quantity", "Quantity");

  if (!input.currency) errors.currency = "Currency is required";
  if (!input.priceBasis) errors.priceBasis = "Price basis is required";
  if (!input.routeId) errors.routeId = "Route is required";
  if (!input.shippingMethod) errors.shippingMethod = "Shipping method is required";
  if (!input.category) errors.category = "Product category is required";
  if (!input.supplierName || !String(input.supplierName).trim())
    errors.supplierName = "Supplier name is required";

  return { valid: Object.keys(errors).length === 0, errors };
}

function supplierDigits(input) {
  const seed = String(input.supplierCode || input.supplierName || "SUP");
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return String(hash % 1000).padStart(3, "0");
}

export function generateSupplierCode({ category, routeMeta, supplierDigits: sd, costTierId, metersInRoll }) {
  const catLetter = (category?.abbr || category?.name || "X").toString().trim().charAt(0).toUpperCase() || "X";
  const routeLetter = (routeMeta?.sourceLetter || "X").toUpperCase();
  const tier = String(costTierId ?? 0);
  const meters = String(Math.round(num(metersInRoll) || 0)).padStart(2, "0");
  return `${catLetter}${routeLetter}${sd}${tier}${meters}`;
}

function applyCustomRules(config, ctx) {
  const rules = config.customRules || [];
  const applied = [];
  let total = 0;
  for (const rule of rules) {
    const catOk = rule.category === "any" || rule.category === ctx.categoryId;
    const routeOk = rule.routeId === "any" || rule.routeId === ctx.routeId;
    if (catOk && routeOk) {
      const amount =
        rule.adjustType === "flat"
          ? num(rule.value) || 0
          : (ctx.productCost * (num(rule.value) || 0)) / 100;
      total += amount;
      applied.push({ id: rule.id, name: rule.name, amount: round2(amount) });
    }
  }
  return { total, applied };
}

export function calculateLandedCost(input, config) {
  const { valid, errors } = validateInput(input);
  if (!valid) return { valid: false, errors };

  const rates = config.currencyRates || {};
  const currency = input.currency || "ZAR";
  const metersInRoll = num(input.metersInRoll);
  const weight = num(input.weight);
  const quantity = num(input.quantity) || 1;

  // Buying price -> ZAR, then per-roll product cost.
  const priceZar = toZar(num(input.buyingPrice), currency, rates);
  const productCost =
    input.priceBasis === "per_roll" ? priceZar : priceZar * metersInRoll;

  const routeMeta = getRouteMeta(input.routeId);
  const category = (config.categories || []).find((c) => c.id === input.category) || null;

  // Shipping rate is stored in the route's source currency -> convert -> per kg.
  const shipRateSrc = num(config.shippingRates?.[input.routeId]?.[input.shippingMethod]) || 0;
  const ratePerKg = toZar(shipRateSrc, routeMeta?.currency || "ZAR", rates);
  const shippingCost = ratePerKg * weight;

  const dutyEnabled = input.dutyEnabled !== false; // default on
  // Per-category duty rate, falling back to the global config rate when unset/blank.
  const catRate = num(category?.dutyRate);
  const baseDutyRate = Number.isFinite(catRate) ? catRate : (num(config.dutyRate) || 0);
  const effectiveDutyRate = dutyEnabled ? baseDutyRate : 0;
  const customsDuty = (productCost * effectiveDutyRate) / 100;

  const handlingPercent = (productCost * (num(config.handlingFeeRate) || 0)) / 100;
  const handlingFlat = num(config.handlingFeeFlat) || 0;
  const handlingFee = handlingPercent + handlingFlat;

  const { total: customAdjustment, applied: appliedRules } = applyCustomRules(config, {
    categoryId: input.category,
    routeId: input.routeId,
    productCost,
  });

  const subtotal = productCost + shippingCost + customsDuty + handlingFee + customAdjustment;
  const tax = (subtotal * (num(config.taxRate) || 0)) / 100;
  const totalLandedCost = subtotal + tax;

  const costPerRoll = totalLandedCost;
  const costPerMeter = metersInRoll > 0 ? totalLandedCost / metersInRoll : 0;

  const orderTotal =
    input.qtyUnit === "meter" ? costPerMeter * quantity : costPerRoll * quantity;

  const costTier = findCostTier(costPerMeter, config.costTiers);

  // CP = Cost Price in ZAR (buying price converted, before shipping/duty/fees).
  const cpZarPerMeter = metersInRoll > 0 ? productCost / metersInRoll : 0;
  const cpZarPerRoll = productCost;

  const supplierCode = generateSupplierCode({
    category,
    routeMeta,
    supplierDigits: supplierDigits(input),
    costTierId: costTier?.id,
    metersInRoll,
  });

  return {
    valid: true,
    errors: {},
    breakdown: {
      priceZar: round2(priceZar),
      currency,
      productCost: round2(productCost),
      shippingCost: round2(shippingCost),
      ratePerKg: round2(ratePerKg),
      dutyEnabled,
      dutyRate: effectiveDutyRate,
      customsDuty: round2(customsDuty),
      handlingFee: round2(handlingFee),
      customAdjustment: round2(customAdjustment),
      appliedRules,
      subtotal: round2(subtotal),
      tax: round2(tax),
    },
    costTier,
    routeMeta,
    category,
    quantity,
    qtyUnit: input.qtyUnit,
    orderTotal: round2(orderTotal),
    cpZarPerMeter: round2(cpZarPerMeter),
    cpZarPerRoll: round2(cpZarPerRoll),
    totalLandedCost: round2(totalLandedCost),
    costPerRoll: round2(costPerRoll),
    costPerMeter: round2(costPerMeter),
    supplierCode,
  };
}

export const currency = (n) =>
  `R ${Number(n || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const rateFmt = (n) =>
  Number(n || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
