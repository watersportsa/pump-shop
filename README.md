# Marine Pump Shop — WhatsApp/Email Ordering Platform with Cart

A lightweight, static product catalog and ordering tool for Jabsco/Rule
marine pumps. Customers browse by category, select multiple models or
variants per product with individual quantities, add them to a
persistent cart, and check out the entire cart in one consolidated
message — via **WhatsApp** or **Email**.

## What's new: shopping cart & multi-model ordering

- **Model/variant selection per product**: Each product detail view lists
  every model/variant as its own row with a quantity stepper. You can
  select quantities for several different models of the same product at
  once (e.g., 2× the 24DA and 1× the 27DA of Rule Standard Bilge Pumps)
  and add them all to the cart together with **"Add Selected to Cart"**.
- **Persistent cart**: A cart icon in the header shows a live item count.
  The cart survives page reloads (stored in the browser's `localStorage`)
  so customers can keep browsing and adding items across multiple
  products before checking out.
- **Cart drawer**: Click the cart icon to open a slide-out panel listing
  every line item (product + model + quantity), with steppers to adjust
  quantity or remove items, and a running total.
- **One-click consolidated checkout**: "Checkout via WhatsApp" and
  "Checkout via Email" build a single, numbered order message covering
  every item in the cart — no need to send multiple separate messages
  for multiple products.

## Catalog accuracy policy

This catalog is reconciled against live Xylem.com product pages — see
[`data/RECONCILIATION_LOG.md`](data/RECONCILIATION_LOG.md). In short: a
product is only listed if it currently appears on a live Xylem.com
product page; discontinued items are excluded. Every entry links to its
verifying Xylem source page (`xylemUrl` field).

This pilot release covers **Bilge Pumping Systems**: 39 products.

## How it works

- Pure static site: HTML + CSS + vanilla JavaScript. No build step, no
  server, no database required to host.
- Product data lives in [`data/products.json`](data/products.json).
- Store settings (name, WhatsApp number, order email) live in
  [`data/config.json`](data/config.json).
- Cart state lives in the browser's `localStorage` — nothing is sent
  anywhere until the customer explicitly taps "Checkout via WhatsApp" or
  "Checkout via Email".

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

Whenever you extract a new category, follow the reconciliation process
in `data/RECONCILIATION_LOG.md`: verify each candidate product against a
live Xylem.com page before adding it, and populate `xylemUrl` and
`xylemStatus` on every new entry. The cart and model-selection UI work
automatically for any new products added to `products.json` — no code
changes needed, as long as each product has a `models` array (even a
single-entry one).

## Project structure

```
pump-shop/
├── index.html          # page structure incl. cart drawer & product modal
├── css/style.css        # all styling incl. cart drawer & qty steppers
├── js/app.js             # data loading, rendering, cart logic (localStorage)
├── data/
│   ├── config.json
│   ├── products.json            # 39 products, Xylem-verified
│   └── RECONCILIATION_LOG.md
├── assets/images/
├── GITHUB_SETUP.md
└── README.md
```
