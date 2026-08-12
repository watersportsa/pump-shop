#!/usr/bin/env python3
"""
Splits combined multi-model strings (e.g. "25DA / 25DA-24") in products.json
into individual selectable model/variant rows, tagging each with its voltage
where the model number or existing note confirms it (Rule/Jabsco convention:
no suffix = 12V, "-24" = 24V, "-32" = 32V, unless a note already states
per-model voltage explicitly).
"""
import json

with open("/home/claude/pump-shop/data/products.json") as f:
    products = json.load(f)

# Explicit per-product replacement model lists.
# Each entry: list of {"model": ..., "note": ...} replacing the old "models" array.
REPLACEMENTS = {
    "bp-001": [
        {"model": "24DA", "note": "360 GPH (1363 LPH), 12V"},
        {"model": "25DA", "note": "500 GPH (1893 LPH), 12V"},
        {"model": "25DA-24", "note": "500 GPH (1893 LPH), 24V"},
        {"model": "20DA", "note": "800 GPH (3028 LPH), 12V"},
        {"model": "20DA-24", "note": "800 GPH (3028 LPH), 24V"},
        {"model": "27DA", "note": "1100 GPH (4164 LPH), 12V"},
        {"model": "27DA-24", "note": "1100 GPH (4164 LPH), 24V"},
        {"model": "04", "note": "1500 GPH (5678 LPH)"},
        {"model": "03", "note": "1500 GPH (5678 LPH)"},
        {"model": "02-6", "note": "1500 GPH (5678 LPH)"},
        {"model": "02", "note": "1500 GPH (5678 LPH)"},
        {"model": "12", "note": "2000 GPH (7571 LPH)"},
        {"model": "11", "note": "2000 GPH (7571 LPH)"},
        {"model": "10-6UL", "note": "2000 GPH (7571 LPH)"},
        {"model": "10", "note": "2000 GPH (7571 LPH)"},
        {"model": "09", "note": "2000 GPH (7571 LPH)"},
        {"model": "15A", "note": "3700 GPH (14,010 LPH)"},
        {"model": "16A", "note": "3700 GPH (14,010 LPH)"},
        {"model": "14A-6UL", "note": "3700 GPH (14,010 LPH)"},
        {"model": "14A", "note": "3700 GPH (14,010 LPH)"},
        {"model": "13A", "note": "3700 GPH (14,010 LPH)"},
        {"model": "56D", "note": "4000 GPH (15,140 LPH), 12V"},
        {"model": "56D-24", "note": "4000 GPH (15,140 LPH), 24V"},
        {"model": "56D-32", "note": "4000 GPH (15,140 LPH), 32V"},
    ],
    "bp-002": [
        {"model": "25S-6", "note": "500 GPH (1893 LPH)"},
        {"model": "25S", "note": "500 GPH (1893 LPH), 12V"},
        {"model": "25S-24", "note": "500 GPH (1893 LPH), 24V"},
        {"model": "20RS", "note": "800 GPH (3028 LPH)"},
        {"model": "27S", "note": "1100 GPH (4164 LPH)"},
        {"model": "51S", "note": "1500 GPH (5678 LPH)"},
        {"model": "53S", "note": "2000 GPH (7571 LPH)"},
        {"model": "55S", "note": "3700 GPH (14,010 LPH)"},
        {"model": "56S", "note": "4000 GPH (15,140 LPH)"},
    ],
    "bp-003": [
        {"model": "RM500A", "note": "500 GPH (1893 LPH), 12V"},
        {"model": "RM500A-24", "note": "500 GPH (1893 LPH), 24V"},
        {"model": "RM750A", "note": "750 GPH (2839 LPH), 12V"},
        {"model": "RM750A-24", "note": "750 GPH (2839 LPH), 24V"},
        {"model": "RM1100A", "note": "1100 GPH (4164 LPH), 12V"},
        {"model": "RM1100A-24", "note": "1100 GPH (4164 LPH), 24V"},
        {"model": "RM1500A", "note": "1500 GPH (5678 LPH), 12V"},
        {"model": "RM2000A", "note": "2000 GPH (7571 LPH), 12V"},
        {"model": "RM2000A-24", "note": "2000 GPH (7571 LPH), 24V"},
    ],
    "bp-009": [
        {"model": "41", "note": "3-Way Panel Switch — Lighted, 12V"},
        {"model": "42", "note": "3-Way Panel Switch — Lighted, 24V"},
        {"model": "43", "note": "3-Way Rocker Panel Switch — Lighted, 12V"},
        {"model": "44", "note": "3-Way Rocker Panel Switch — Lighted, 24V"},
        {"model": "45", "note": "3-Way Panel Switch (no light)"},
        {"model": "49", "note": "2-Way Panel Switch"},
    ],
    "bp-010": [
        {"model": "98B", "note": "Shower Drain Box, 12V"},
        {"model": "98B-24", "note": "Shower Drain Box, 24V"},
    ],
    "bp-017a": [
        {"model": "260", "note": "3/4\" (19mm) hose size"},
        {"model": "261", "note": "1-1/8\" (29mm) hose size"},
    ],
    "bp-017b": [
        {"model": "212", "note": "Y Fitting, 3/4\""},
        {"model": "213", "note": "Y Fitting, 1-1/8\""},
        {"model": "215", "note": "T Fitting, 3/4\""},
        {"model": "216", "note": "T Fitting, 1-1/8\""},
    ],
    "bp-045": [
        {"model": "4732-0000", "note": "Vacuum Switch"},
        {"model": "4732-0001", "note": "Vacuum Switch, alternate configuration"},
        {"model": "4732-0010", "note": "Vacuum Switch, alternate configuration"},
    ],
}

changed = 0
for p in products:
    if p["id"] in REPLACEMENTS:
        p["models"] = REPLACEMENTS[p["id"]]
        changed += 1

with open("/home/claude/pump-shop/data/products.json", "w") as f:
    json.dump(products, f, indent=2, ensure_ascii=False)
    f.write("\n")

print(f"Updated {changed} products with split voltage/model variants.")
total_variants = sum(len(p["models"]) for p in products)
print(f"Total selectable model/variant rows across catalog: {total_variants}")
