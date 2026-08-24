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
- Dashboard with metrics, most-recent card, exchange-rate reference, recent history with timestamps + delete + clear-all.
- Live calculator with validation, cost breakdown, cost-tier badge, copy supplier code, save to history; draft persists across tab switches.
- Configuration: shipping rates per route/method/tier, weight tiers, categories, duties/fees/tax, cost-tier bands, custom rules, exchange rates, reset-to-defaults — all editable + persisted.
- Responsive (desktop pill nav + mobile bottom nav). Consistent en-ZA currency formatting.
- Verified: testing agent 100% of core flows; engine reference case R92,05/m, R828,46 total.

## Backlog
- P1: Export/share a calculation (PDF/CSV), duplicate a past calculation into the form.
- P2: Search/filter history; per-category customs duty override; config import/export (JSON).
- P2: Versioned config migration to back-fill new nested default keys for existing users.

## Next Tasks
- Awaiting user feedback on real pricing values and any additional routes/categories.
