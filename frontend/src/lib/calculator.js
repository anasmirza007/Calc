import { ROUTES } from "@/lib/defaults";

// ---------------------------------------------------------------------------
// Import Landed Cost calculation engine.
// Pure, dependency-free functions. Accepts an input + config and returns a
// full breakdown. Safe to unit-test in isolation.
// ---------------------------------------------------------------------------

const num = (v) => {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : NaN;
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export function findWeightTier(weight, tiers = []) {
  if (!tiers.length) return null;
  const w = num(weight);
  const match = tiers.find(
    (t) => w >= num(t.min) && (t.max == null || w < num(t.max))
  );
  return match || tiers[tiers.length - 1];
}

export function findCostTier(costPerMeter, costTiers = []) {
  if (!costTiers.length) return { id: 0, label: "N/A" };
  const c = num(costPerMeter);
  const match = costTiers.find((t) => t.max == null || c < num(t.max));
  return match || costTiers[costTiers.length - 1];
}

export function getRouteMeta(routeId) {
  return ROUTES.find((r) => r.id === routeId) || null;
}

// Validate a calculation input. Returns { valid, errors: {field: message} }.
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

  requirePositive("pricePerMeter", "Price per meter", true);
  requirePositive("metersInRoll", "Meters in roll");
  requirePositive("weight", "Weight");

  if (!input.routeId) errors.routeId = "Route is required";
  if (!input.shippingMethod) errors.shippingMethod = "Shipping method is required";
  if (!input.category) errors.category = "Product category is required";
  if (!input.supplierName || !String(input.supplierName).trim())
    errors.supplierName = "Supplier name is required";

  return { valid: Object.keys(errors).length === 0, errors };
}

// Deterministic 3-digit identifier derived from supplier code/name.
function supplierDigits(input) {
  const seed = String(input.supplierCode || input.supplierName || "SUP");
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return String(hash % 1000).padStart(3, "0");
}

// Supplier code = categoryLetter + routeLetter + supplierId(3) + costTier(1) + meters
// e.g. Lace + India + roll of 9m at Low tier => "LI0170 09" => "LI017009"
export function generateSupplierCode({ category, routeMeta, supplierDigits: sd, costTierId, metersInRoll }) {
  const catLetter = (category?.abbr || category?.name || "X").toString().trim().charAt(0).toUpperCase() || "X";
  const routeLetter = (routeMeta?.sourceLetter || "X").toUpperCase();
  const tier = String(costTierId ?? 0);
  const meters = String(Math.round(num(metersInRoll) || 0)).padStart(2, "0");
  return `${catLetter}${routeLetter}${sd}${tier}${meters}`;
}

// Apply matching custom rules. Returns { total, applied: [...] }.
function applyCustomRules(config, ctx) {
  const rules = config.customRules || [];
  const applied = [];
  let total = 0;
  for (const rule of rules) {
    const catOk = rule.category === "any" || rule.category === ctx.categoryId;
    const tierOk = rule.tierId === "any" || rule.tierId === ctx.tierId;
    const routeOk = rule.routeId === "any" || rule.routeId === ctx.routeId;
    if (catOk && tierOk && routeOk) {
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

// Main engine. Returns a full breakdown object (never throws).
export function calculateLandedCost(input, config) {
  const { valid, errors } = validateInput(input);
  if (!valid) {
    return { valid: false, errors };
  }

  const pricePerMeter = num(input.pricePerMeter);
  const metersInRoll = num(input.metersInRoll);
  const weight = num(input.weight);

  const productCost = pricePerMeter * metersInRoll;

  const tier = findWeightTier(weight, config.weightTiers);
  const routeMeta = getRouteMeta(input.routeId);

  const ratePerKg =
    config.shippingRates?.[input.routeId]?.[input.shippingMethod]?.[tier?.id] ?? 0;
  const shippingCost = ratePerKg * weight;

  const customsDuty = (productCost * (num(config.customsDutyRate) || 0)) / 100;
  const handlingPercent = (productCost * (num(config.handlingFeeRate) || 0)) / 100;
  const handlingFlat = num(config.handlingFeeFlat) || 0;
  const handlingFee = handlingPercent + handlingFlat;

  const { total: customAdjustment, applied: appliedRules } = applyCustomRules(config, {
    categoryId: input.category,
    tierId: tier?.id,
    routeId: input.routeId,
    productCost,
  });

  const subtotal = productCost + shippingCost + customsDuty + handlingFee + customAdjustment;
  const tax = (subtotal * (num(config.taxRate) || 0)) / 100;
  const totalLandedCost = subtotal + tax;

  const costPerRoll = totalLandedCost;
  const costPerMeter = metersInRoll > 0 ? totalLandedCost / metersInRoll : 0;

  const costTier = findCostTier(costPerMeter, config.costTiers);
  const category = (config.categories || []).find((c) => c.id === input.category) || null;

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
      productCost: round2(productCost),
      shippingCost: round2(shippingCost),
      ratePerKg: round2(ratePerKg),
      customsDuty: round2(customsDuty),
      handlingFee: round2(handlingFee),
      customAdjustment: round2(customAdjustment),
      appliedRules,
      subtotal: round2(subtotal),
      tax: round2(tax),
    },
    weightTier: tier,
    costTier,
    routeMeta,
    category,
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

// Reference exchange-rate formatter (same en-ZA locale for consistency).
export const rateFmt = (n) =>
  Number(n || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
