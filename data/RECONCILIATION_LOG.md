# Catalog Reconciliation Log — Bilge Pumping Systems

**Date reconciled:** August 2026
**Sources compared:**
1. Original source catalog (Jabsco-Pump-Catalog.pdf) — 45 products across 10 subcategories
2. Live Xylem.com product pages (xylem.com/en-us/...) — current, real-time product listings

## Standing Rule (applies to all future catalog updates)

> **A product is only listed on this site if it currently appears on a live Xylem.com product page.** Products explicitly marked "DISCONTINUED" by Xylem, or for which no current Xylem product page can be found, are removed from the catalog — even if they appeared in the original supplier catalog. When Xylem has consolidated several old SKUs into a single current product family, the site reflects that consolidation (one card, multiple model variants) rather than the old, separate listings.

## Result: 39 products kept (of 45 original), 6 removed, 2 added

### Removed — no current Xylem product page found
| Removed item | Reason |
|---|---|
| Rule 360 / Rule 500 / Rule 750 (old model families) | Explicitly listed as **DISCONTINUED** on Xylem's live Bilge Pumps page |
| Bilge Hoses (PVC/Ribbed/Polyethylene) | No current standalone Xylem product page found |
| Replacement Strainer Bases & Side Mount Bracket | No current standalone Xylem product page found; superseded by general "Jabsco Strainers" family |
| Shower Drain Check Valve (M-1086) | No current standalone Xylem product page found |
| Jabsco 31705/31610 Series diaphragm pumps | No current Xylem product page found; superseded by 36600/36680 series |

### Added — current Xylem products not in the original catalog
| Added item | Xylem source |
|---|---|
| Rule Dry Bilge Pump (DB412) | xylem.com/.../bilge-pumps/db412/ |
| Rule Submersible Utility Pump | xylem.com/.../bilge-pumps/110-volt-pumps-1d144088/ |

### Consolidated — old separate SKUs now sold as one current Xylem product family
| Old catalog entries | Now consolidated as |
|---|---|
| SuperSwitch, Rule-A-Matic, Rule-A-Matic Plus, ECO-Switch, High-Water Bilge Alarm | Rule Bilge Pump Float Switches (kept as 5 separate cards for ordering clarity, all citing the same current Xylem family page) |
| 11870, 18330, 50580, 50270, 50220, 50200 (electric clutch) | Jabsco Electro-Magnetic Clutch Pumps (1 consolidated card) |
| 51200, 51270, 51580 (manual clutch) | Jabsco Manual Clutch Pumps (1 consolidated card) |
| Amazon Bulkhead, Universal, Thrudeck, Warrior | Jabsco Manual Bilge Pumps (kept as 4 separate cards, all citing the same current Xylem family page) |
| Water Puppy, Maxi Puppy, Junior Puppy, Utility Puppy 2000/3000, Mini Puppy | Jabsco Puppy Series (kept as separate cards, all citing the same current Xylem family page) |
| Bilge Strainers accessory + Pumpgard Strainer | Jabsco Strainers (merged into 1 general strainer card, Pumpgard kept as a second diaphragm-specific card) |

### Recategorized (moved subcategory to match current Xylem site structure)
- Rule High-Water Bilge Alarm: moved from "General Purpose Pumps" → "Bilge Pump Float Switches & Panel Switches" (matches Xylem's current grouping)
- Jabsco Y-Valve: still listed here for bilge use, but Xylem now categorizes it primarily under "Toilet System Accessories" — noted in its description

## Data fields added for traceability
Every product entry now includes:
- `"xylemUrl"` — direct link to the live Xylem product page used to verify the entry
- `"xylemStatus"` — currently always `"current"` (only current products are kept per the standing rule above)
- `"isNewProduct"` — `true` for the 2 newly-added products not in the original catalog

## Applying this rule going forward
When adding new catalog categories (Toilet Systems, Water Pressure Systems, etc.), repeat this process:
1. Extract candidate products from the source catalog for that category.
2. Search Xylem.com for each product family by name/model number.
3. Only add products confirmed on a live Xylem product page.
4. Note consolidations, discontinuations, and new products the same way this log does.
5. Always populate `xylemUrl` and `xylemStatus` for every entry.
