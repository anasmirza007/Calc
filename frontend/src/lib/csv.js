// Build a CSV from calculation history records and trigger a download.

const COLUMNS = [
  ["Date", (r) => new Date(r.timestamp || Date.now()).toLocaleString("en-ZA")],
  ["Supplier", (r) => r.input?.supplierName],
  ["Supplier Ref", (r) => r.input?.supplierCode],
  ["Generated Code", (r) => r.result?.supplierCode],
  ["Product", (r) => r.input?.productName],
  ["Category", (r) => r.result?.category?.name],
  ["Sub-category", (r) => r.input?.subCategory],
  ["Route", (r) => r.result?.routeMeta?.name],
  ["Method", (r) => r.input?.shippingMethod],
  ["Currency", (r) => r.input?.currency],
  ["Buying Price", (r) => r.input?.buyingPrice],
  ["Price Basis", (r) => r.input?.priceBasis],
  ["Meters/Roll", (r) => r.input?.metersInRoll],
  ["Weight (kg)", (r) => r.input?.weight],
  ["Qty", (r) => r.input?.quantity],
  ["Unit", (r) => r.input?.qtyUnit],
  ["Duty", (r) => (r.input?.dutyEnabled === false ? "No" : "Yes")],
  ["CP/m (ZAR)", (r) => r.result?.cpZarPerMeter],
  ["CP/roll (ZAR)", (r) => r.result?.cpZarPerRoll],
  ["Cost/m (ZAR)", (r) => r.result?.costPerMeter],
  ["Cost/roll (ZAR)", (r) => r.result?.costPerRoll],
  ["Total Landed (ZAR)", (r) => r.result?.totalLandedCost],
  ["Order Total (ZAR)", (r) => r.result?.orderTotal],
];

const cell = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function historyToCsv(records = []) {
  const header = COLUMNS.map((c) => cell(c[0])).join(",");
  const rows = records.map((r) => COLUMNS.map((c) => cell(c[1](r))).join(","));
  return [header, ...rows].join("\n");
}

export function downloadCsv(records, filename) {
  const csv = historyToCsv(records);
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `landedcost-history-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
