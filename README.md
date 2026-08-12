# Marine Pump Shop — WhatsApp/Email Ordering Platform

A lightweight, static product catalog and ordering tool for Jabsco/Rule
marine pumps. Customers browse by category, view specifications, and
place an order with one click — via **WhatsApp** or **Email**.

## Catalog accuracy policy (important)

This catalog is **reconciled against live Xylem.com product pages**, not
just the original supplier PDF catalog. See
[`data/RECONCILIATION_LOG.md`](data/RECONCILIATION_LOG.md) for the full
methodology and audit trail. In short:

> **A product is only listed here if it currently appears on a live
> Xylem.com product page.** Discontinued products are removed, even if
> they were in the original catalog. New current products not in the
> original catalog are added. Every entry links to its current Xylem
> source page (`xylemUrl` field) for verification.

This pilot release covers **Bilge Pumping Systems**: 39 products
verified current as of August 2026 (6 removed as discontinued/unlisted,
2 added as newly-found current products, several consolidated to match
Xylem's current product family structure).

## How it works

- Pure static site: HTML + CSS + vanilla JavaScript. No build step, no
  server, no database required to host.
- Product data lives in [`data/products.json`](data/products.json).
- Store settings (name, WhatsApp number, order email) live in
  [`data/config.json`](data/config.json).
- Each product card shows a **"View current product page on Xylem.com"**
  link so customers (and you) can always verify current pricing/specs
  directly at the source.
- "Order via WhatsApp" opens `wa.me` with a pre-filled message. "Order
  via Email" opens a `mailto:` link with the subject/body pre-filled.

## Quick start (run locally)

```bash
cd pump-shop
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` by double-clicking won't work — browsers block
`fetch()` of local JSON files without a server.)

## Deploying to GitHub Pages

See [`GITHUB_SETUP.md`](GITHUB_SETUP.md) for a full click-by-click,
no-terminal-required walkthrough.

## Updating the catalog going forward

Whenever you extract a new category (Toilet Systems, Water Pressure
Systems, etc.), follow the same reconciliation process documented in
`data/RECONCILIATION_LOG.md`:
1. Extract candidate products from the source catalog.
2. Verify each against a live Xylem.com product page.
3. Only keep products confirmed current; note removals/additions.
4. Populate `xylemUrl` and `xylemStatus` on every new entry.

## Project structure

```
pump-shop/
├── index.html
├── css/style.css
├── js/app.js
├── data/
│   ├── config.json
│   ├── products.json            # 39 products, Xylem-verified
│   └── RECONCILIATION_LOG.md    # reconciliation methodology & audit trail
├── assets/images/
├── scripts/                     # PDF image extraction helper (optional)
├── GITHUB_SETUP.md
└── README.md
```
