# Catalog Reconciliation Log — Bilge Pumping Systems

**Sources compared:**
1. Original source catalog (Jabsco-Pump-Catalog.pdf) — 45 products across 10 subcategories
2. Live Xylem.com product pages (xylem.com/en-us/...) — current, real-time product listings

## Standing Rule (applies to all future catalog updates)

> A product is only listed on this site if it currently appears on a live Xylem.com product page. Products explicitly marked "DISCONTINUED" by Xylem, or for which no current Xylem product page can be found, are removed from the catalog — even if they appeared in the original supplier catalog. When Xylem has consolidated several old SKUs into a single current product family, the site reflects that consolidation (one card, multiple model variants) rather than the old, separate listings.

## Result: 39 products kept (of 45 original), 6 removed, 2 added

### Removed — no current Xylem product page found
- Rule 360 / Rule 500 / Rule 750 (old model families) — explicitly listed as DISCONTINUED on Xylem
- Bilge Hoses (PVC/Ribbed/Polyethylene) — no current standalone Xylem product page found
- Replacement Strainer Bases & Side Mount Bracket — superseded by general "Jabsco Strainers" family
- Shower Drain Check Valve (M-1086) — no current standalone Xylem product page found
- Jabsco 31705/31610 Series diaphragm pumps — superseded by 36600/36680 series

### Added — current Xylem products not in the original catalog
- Rule Dry Bilge Pump (DB412)
- Rule Submersible Utility Pump

### Consolidated — old separate SKUs now sold as one current Xylem product family
- SuperSwitch, Rule-A-Matic, Rule-A-Matic Plus, ECO-Switch, High-Water Bilge Alarm → Rule Bilge Pump Float Switches family
- 11870, 18330, 50580, 50270, 50220, 50200 (electric clutch) → Jabsco Electro-Magnetic Clutch Pumps
- 51200, 51270, 51580 (manual clutch) → Jabsco Manual Clutch Pumps
- Amazon Bulkhead, Universal, Thrudeck, Warrior → Jabsco Manual Bilge Pumps family
- Water Puppy, Maxi Puppy, Junior Puppy, Utility Puppy 2000/3000, Mini Puppy → Jabsco Puppy Series
- Bilge Strainers accessory + Pumpgard Strainer → Jabsco Strainers family

## Data fields added for traceability
Every product entry includes `xylemUrl` (link to the verifying live Xylem
product page), `xylemStatus` (always `"current"`), and `isNewProduct`
(`true` for the 2 newly-added products).

## Applying this rule going forward
When adding new catalog categories, repeat this process: extract
candidates from the source catalog, verify each against a live Xylem
product page, only keep confirmed-current products, and note
consolidations/discontinuations/additions the same way this log does.
