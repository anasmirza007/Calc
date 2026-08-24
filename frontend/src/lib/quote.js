// Builds a clean printable quote sheet and opens the browser print dialog
// (user can "Save as PDF"). Dependency-free.

const R = (n) =>
  `R ${Number(n || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export function printQuote(record) {
  if (!record?.result?.valid && !record?.result?.supplierCode) return null;
  const { input = {}, result = {}, timestamp } = record;
  const b = result.breakdown || {};
  const date = new Date(timestamp || Date.now()).toLocaleString("en-ZA", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const ruleRows = (b.appliedRules || [])
    .map((r) => `<tr><td>${esc(r.name)}</td><td class="r">${R(r.amount)}</td></tr>`)
    .join("");

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Quote ${esc(result.supplierCode)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 40px; }
  .wrap { max-width: 720px; margin: 0 auto; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
  .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
  .brand span { color: #2563eb; }
  .sub { color: #64748b; font-size: 12px; margin-top: 2px; }
  .code { text-align: right; }
  .code .lbl { text-transform: uppercase; letter-spacing: .18em; font-size: 10px; color: #64748b; }
  .code .val { font-family: "Courier New", monospace; font-size: 26px; font-weight: 700; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .18em; color: #64748b; margin: 28px 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  td { padding: 7px 0; border-bottom: 1px solid #e2e8f0; }
  td.r { text-align: right; font-family: "Courier New", monospace; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; font-size: 14px; }
  .grid .k { color: #64748b; }
  .totals td { border: none; padding: 6px 0; }
  .totals .sum td { border-top: 2px solid #0f172a; padding-top: 12px; font-weight: 800; font-size: 18px; }
  .totals .sum td.r { color: #059669; }
  .hero { display: flex; gap: 16px; margin-top: 8px; }
  .hero .box { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
  .hero .box .lbl { text-transform: uppercase; letter-spacing: .16em; font-size: 10px; color: #64748b; }
  .hero .box .v { font-family: "Courier New", monospace; font-size: 22px; font-weight: 800; margin-top: 4px; }
  .hero .box.green .v { color: #059669; }
  .foot { margin-top: 36px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  @media print { body { padding: 0; } .wrap { max-width: none; } }
</style></head>
<body><div class="wrap">
  <div class="head">
    <div>
      <div class="brand">Landed<span>Cost</span></div>
      <div class="sub">Import Pricing Quote · ${esc(date)}</div>
    </div>
    <div class="code">
      <div class="lbl">Supplier Code</div>
      <div class="val">${esc(result.supplierCode)}</div>
    </div>
  </div>

  <div class="hero">
    <div class="box green"><div class="lbl">Cost / Meter</div><div class="v">${R(result.costPerMeter)}</div></div>
    <div class="box"><div class="lbl">Cost / Roll</div><div class="v">${R(result.costPerRoll)}</div></div>
    <div class="box"><div class="lbl">Total Landed</div><div class="v">${R(result.totalLandedCost)}</div></div>
  </div>

  <h2>Supplier &amp; Shipment</h2>
  <div class="grid">
    <div class="k">Supplier</div><div>${esc(input.supplierName)}</div>
    <div class="k">Supplier ref</div><div>${esc(input.supplierCode || "—")}</div>
    <div class="k">Product</div><div>${esc(input.productName || "—")}</div>
    <div class="k">Category</div><div>${esc(result.category?.name)}${input.subCategory ? " · " + esc(input.subCategory) : ""}</div>
    <div class="k">Route</div><div>${esc(result.routeMeta?.name)}</div>
    <div class="k">Shipping method</div><div>${esc(input.shippingMethod)}</div>
    <div class="k">Shipping time</div><div>${esc(input.shippingTime || "—")}</div>
    <div class="k">Quantity</div><div>${esc(result.quantity)} ${esc(result.qtyUnit)}</div>
    <div class="k">Meters in roll</div><div>${esc(input.metersInRoll)} m</div>
    <div class="k">Weight</div><div>${esc(input.weight)} kg</div>
    <div class="k">Buying price</div><div>${esc(input.currency)} ${esc(input.buyingPrice)} (${input.priceBasis === "per_roll" ? "per roll" : "per meter"})</div>
    <div class="k">Import duty</div><div>${b.dutyEnabled ? "Yes · " + esc(b.dutyRate) + "%" : "No · 0%"}</div>
  </div>

  <h2>Cost Breakdown</h2>
  <table>
    <tr><td>Product cost (${esc(b.currency)} → ZAR)</td><td class="r">${R(b.productCost)}</td></tr>
    <tr><td>Shipping (${esc(input.weight)} kg @ ${R(b.ratePerKg)}/kg)</td><td class="r">${R(b.shippingCost)}</td></tr>
    <tr><td>Customs duty${b.dutyEnabled ? " (" + esc(b.dutyRate) + "%)" : " (off)"}</td><td class="r">${R(b.customsDuty)}</td></tr>
    <tr><td>Handling &amp; fees</td><td class="r">${R(b.handlingFee)}</td></tr>
    ${ruleRows}
  </table>

  <h2>Totals</h2>
  <table class="totals">
    <tr><td>Subtotal</td><td class="r">${R(b.subtotal)}</td></tr>
    <tr><td>VAT</td><td class="r">${R(b.tax)}</td></tr>
    <tr class="sum"><td>Total landed cost (per roll)</td><td class="r">${R(result.totalLandedCost)}</td></tr>
    <tr><td>Order total (${esc(result.quantity)} ${esc(result.qtyUnit)})</td><td class="r">${R(result.orderTotal)}</td></tr>
  </table>

  <div class="foot">Generated by LandedCost · All prices in South African Rand (ZAR). Prices entered pre-converted to ZAR.</div>
</div>
<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>
</body></html>`;

  const w = window.open("", "_blank", "width=820,height=920");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}