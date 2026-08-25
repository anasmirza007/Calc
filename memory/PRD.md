# LandedCost — Import Pricing Calculator

## Original Problem
Production-ready mobile web app to calculate landed costs for imported goods (India→South Africa, China→South Africa) based on weight, meters, shipping method and product category. All pricing variables fully user-configurable (no code changes). Output in ZAR per meter and per roll, with supplier details and a generated supplier code. Pure frontend, localStorage persistence, no backend/external APIs.

## Architecture
- **Stack:** React 19 (CRA + craco), Tailwind + shadcn/ui, lucide-react icons. NO backend used (template backend untouched).
- **State:** React Context (`AppContext`) holding `config`, `history`, and calculator `draft`; auto-persisted to localStorage (`ipc.config.v1`, `ipc.history.v1`).
- **Calculation engine:** `src/lib/calculator.js` — pure, testable `calculateLandedCost(input, config)` + `validateInput` + `generateSupplierCode`.
- **Data model / defaults:** `src/lib/defaults.js`. Storage helpers: `src/lib/storage.js`.
- **UI:** `Shell.jsx` (header + desktop/mobile nav) → pages `Dashboard.jsx`, `CalculatorPage.jsx`, `Configuration.jsx`.

## User Persona
Import/textile business owner in South Africa pricing rolls of goods (Trims, Lace, Habby, Fabrics) sourced from India/China.

## Core Requirements (static)
- Inputs: weight(kg), meters, method (Air/Ship), category, supplier name/code, price/meter (ZAR), shipping time (info only), route.
- Cost = product + weight/route-tiered shipping + customs duty + handling (flat+%) + custom rules + VAT.
- Outputs: total landed cost, cost/meter, cost/roll (ZAR), supplier details, generated code `catLetter+routeLetter+id+costTier+meters` (e.g. LI343209).
- Fully configurable pricing; exchange rates reference-only (no auto-conversion); data persists across sessions.

## Implemented (2026-06)
- Dashboard with metrics, most-recent card, exchange-rate reference, history with search, timestamps, reuse, PDF export, delete + clear-all.
- Live calculator: multi-currency buying price (INR/CNY/ZAR) auto-converted to ZAR; per-meter / per-roll price basis; quantity + unit (roll/meter/pcs) → order total; sub-category; import-duty toggle (Yes configurable % / No 0%); flat per-kg shipping (Air Safe / Air+ / Ship, rate × weight, no tiers, rates in route source currency); validation; cost breakdown; cost-tier supplier code; copy code; PDF quote export.
- Suppliers & Products master tabs: full CRUD, seeded defaults, one-tap "Use" auto-fills the calculator; in-calculator quick-load selects.
- Configuration: per-route/per-method shipping rates, currency rates, categories + comma-separated sub-categories, duty/handling/tax, cost-tier bands, custom rules (category + route), export/import (deep-merged over defaults), reset.
- Persistence: config (ipc.config.v2, version-gated), history, suppliers, products in localStorage. Draft survives tab switches.
- 5-tab responsive nav (desktop pill / tablet row / mobile bottom bar). Consistent en-ZA currency.
- Verified by testing agent across 3 iterations (latest 95%, no crashes). Engine unit-checked: INR 100/m ×0.21×9 = R189 product, per-kg shipping + duty toggle + order total all correct.

## Backlog
- P1: Duplicate-with-edit (done), CSV export (done), per-category duty (done), PO order summary (done).
- P2: Live FX fetch (optional online mode); PO export as PDF; multi-line PO document.
- P2: Stack mobile shipping-rate table columns under 480px.

## Original engine model (superseded)
- v1 used weight tiers + ZAR-only pricing. v2 replaced tiers with flat per-kg shipping and added multi-currency auto-conversion + duty toggle (config key bumped to ipc.config.v2).
