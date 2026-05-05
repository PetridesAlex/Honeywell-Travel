#!/usr/bin/env python3
"""Generate src/data/rhodesPackage316Hotels.js — Rhodes July/August 2026 catalogue (package 316)."""

import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src/data/rhodesPackage316Hotels.js"

WEBP = "/images/greek-packages-summer/rhodes"

IMG = {
    "Nafsika Hotel – Rhodes": f"{WEBP}/nafsika-hotel.webp",
    "Africa Hotel – Rhodes": f"{WEBP}/africa-hotel.webp",
    "Europa Hotel – Rhodes": f"{WEBP}/europa-hotel.webp",
    "Atlantis Boutique City Hotel & Spa – Rhodes": f"{WEBP}/atlantis-hotel.webp",
    "Esperia City Hotel – Rhodes": f"{WEBP}/esperia-hotel.webp",
    "Manousos City Hotel – Rhodes": f"{WEBP}/manousos-hotel.webp",
    "Amphitryon Boutique Hotel – Rhodes": f"{WEBP}/amphitryon-boutique-hotel.webp",
    "Belair Beach Hotel – Rhodes": f"{WEBP}/bilaire-beach-hotel.webp",
    "Lydia Hotel – Rhodes": f"{WEBP}/lydia-hotel.webp",
    "Semiramis City Hotel – Rhodes": f"{WEBP}/semiramis-hotel.webp",
    "Aquarium Hotel – Rhodes": f"{WEBP}/aquarium-hotel-rhodes.webp",
    "Ibiscus Hotel – Rhodes": f"{WEBP}/imbiscus-hotel-rhodes.webp",
    "Rhodes Palace Luxury Convention Resort  Hotel – Rhodes": f"{WEBP}/rhodes-summer-greece-cover.webp",
    "Dionysos Hotel – Rhodes": f"{WEBP}/dionysos-hotel.webp",
    "Blue Sky City Beach Hotel – Rhodes": f"{WEBP}/blue-sky-hotel-rhodes.webp",
    "Blue Horizon Hotel – Rhodes": f"{WEBP}/blue-horizon-hotel.webp",
    "Mediterranean Hotel – Rhodes": f"{WEBP}/mediteranean-hotel.webp",
    "Cactus Hotel – Rhodes": f"{WEBP}/cactus-hotel.webp",
    "Plaza Hotel – Rhodes": f"{WEBP}/plaza-hotel.webp",
    "Castellum Suites Hotel – Rhodes": f"{WEBP}/castellum-hotel.webp",
    "Sun Beach Resort Complex – Rhodes": f"{WEBP}/sun-beach-resort.webp",
    "Rodos Palladium – Rhodes": f"{WEBP}/rhodes-palladium.webp",
    "Eden Roc Resort Hotel – Rhodes": f"{WEBP}/eden-rock-resort.webp",
}

LOC = {
    "Nafsika Hotel – Rhodes": "8, Parodiakou Sillogou Amerikis Str, 85100, Rhodes, Greece",
    "Africa Hotel – Rhodes": "Alexandrou Diacou Str. 63, 85100, Rhodes, Greece",
    "Europa Hotel – Rhodes": "94, 28th October str, 85100, Rhodes, Greece",
    "Atlantis Boutique City Hotel & Spa – Rhodes": "29 Ionos Dragoumi Str., 85100, Rhodes, Greece",
    "Esperia City Hotel – Rhodes": "7, G.Griva str., Rhodes Town, 85100, Rhodes, Greece",
    "Manousos City Hotel – Rhodes": "G.Leontos 25, Rhodes Town, 85100, Rhodes, Greece",
    "Amphitryon Boutique Hotel – Rhodes": "Alexandrou Diakou 10, Rhodes, 85100, Rhodes, Greece",
    "Belair Beach Hotel – Rhodes": "Ialyssos Avenue Ixia, 85101, Rhodes, Greece",
    "Lydia Hotel – Rhodes": "31, 25th March str., Rhodes Town, 85100, Rhodes, Greece",
    "Semiramis City Hotel – Rhodes": "18 Ioanni Metaxa Street, 85100, Rhodes, Greece",
    "Aquarium Hotel – Rhodes": "G. Haritou Sq. P.C, 85131, Rhodes, Greece",
    "Ibiscus Hotel – Rhodes": "17, Nisirou str., Rhodes Town, 85100, Rhodes, Greece",
    "Rhodes Palace Luxury Convention Resort  Hotel – Rhodes": "Trianton Avenue, Ixia, 85100, Rhodes, Greece",
    "Dionysos Hotel – Rhodes": "Iliadon 4, Main Street Ixia, 85100, Rhodes, Greece",
    "Blue Sky City Beach Hotel – Rhodes": "Rhodes Town, Rhodes, Greece",
    "Blue Horizon Hotel – Rhodes": "Ferenikis - Beach Of Ialyssos, 85101, Rhodes, Greece",
    "Mediterranean Hotel – Rhodes": "35-37, Kos Street, Rhodes Town, 85100, Rhodes, Greece",
    "Cactus Hotel – Rhodes": "14 Kos Street, 85131, Rhodes, Greece",
    "Plaza Hotel – Rhodes": "Ierou Lochou Str., Rhodes Town, 85100, Rhodes, Greece",
    "Castellum Suites Hotel – Rhodes": "Ag.Ioannou 8, Nea Poli, 85100, Rhodes, Greece",
    "Sun Beach Resort Complex – Rhodes": "Ialysos Beach, 85101, Rhodes, Greece",
    "Rodos Palladium – Rhodes": "Faliraki - Kallithea beach, 85100, Rhodes, Greece",
    "Eden Roc Resort Hotel – Rhodes": "Kalithea Avenue, 85100, Rhodes, Greece",
}

STARS = {
    "Nafsika Hotel – Rhodes": 2,
    "Africa Hotel – Rhodes": 2,
    "Europa Hotel – Rhodes": 3,
    "Atlantis Boutique City Hotel & Spa – Rhodes": 3,
    "Esperia City Hotel – Rhodes": 3,
    "Manousos City Hotel – Rhodes": 3,
    "Amphitryon Boutique Hotel – Rhodes": 4,
    "Belair Beach Hotel – Rhodes": 4,
    "Lydia Hotel – Rhodes": 2,
    "Semiramis City Hotel – Rhodes": 4,
    "Aquarium Hotel – Rhodes": 4,
    "Ibiscus Hotel – Rhodes": 4,
    "Rhodes Palace Luxury Convention Resort  Hotel – Rhodes": 5,
    "Dionysos Hotel – Rhodes": 4,
    "Blue Sky City Beach Hotel – Rhodes": 4,
    "Blue Horizon Hotel – Rhodes": 4,
    "Mediterranean Hotel – Rhodes": 5,
    "Cactus Hotel – Rhodes": 3,
    "Plaza Hotel – Rhodes": 4,
    "Castellum Suites Hotel – Rhodes": 4,
    "Sun Beach Resort Complex – Rhodes": 4,
    "Rodos Palladium – Rhodes": 5,
    "Eden Roc Resort Hotel – Rhodes": 4,
}

BB = "Bed and Breakfast"
HB = "Half Board"
AI = "All Inclusive"

J3 = ["13/07", "20/07", "27/07"]
A5 = ["03/08", "10/08", "17/08", "24/08", "31/08"]
A4 = ["03/08", "10/08", "17/08", "24/08"]
MID4 = ["27/07", "03/08", "10/08", "17/08"]
AUG24 = ["03/08", "10/08", "17/08", "24/08"]
LAST2 = ["24/08", "31/08"]
JUL13 = ["13/07"]
JUL2 = ["20/07", "27/07"]
PAL_PAIR = ["13/07", "20/07", "24/08", "31/08"]
FAM_DATES = ["13/07", "20/07", "27/07", "03/08", "10/08", "17/08", "24/08", "31/08"]


def row(name, room, board, prices, pkg, dep, nights=4):
    return {
        "name": name,
        "stars": STARS[name],
        "roomType": room,
        "image": IMG[name],
        "location": LOC[name],
        "boardBasis": board,
        "prices": prices,
        "packagePrice": pkg,
        "departureDate": dep,
        "nights": nights,
    }


def j(x):
    return json.dumps(x, ensure_ascii=False)


def emit_obj(r):
    p = r["prices"]
    keys = [k for k in ("double", "single", "triple", "child1", "child2") if k in p]
    price_str = "{ " + ", ".join(f"{k}: {p[k]}" for k in keys) + " }"
    return (
        "    {\n"
        f"      name: {j(r['name'])},\n"
        f"      stars: {r['stars']},\n"
        f"      roomType: {j(r['roomType'])},\n"
        f"      image: {j(r['image'])},\n"
        f"      location: {j(r['location'])},\n"
        f"      boardBasis: {j(r['boardBasis'])},\n"
        f"      prices: {price_str},\n"
        f"      packagePrice: {r['packagePrice']},\n"
        f"      departureDate: {j(r['departureDate'])},\n"
        f"      nights: {r['nights']}\n"
        "    }"
    )


def add(name, room, board, pkg, prices, dates):
    for d in dates:
        rows.append(row(name, room, board, prices, pkg, d))


rows = []

# --- Nafsika ---
add("Nafsika Hotel – Rhodes", "Standard Room", BB, 1138, {"double": 569}, J3)
add("Nafsika Hotel – Rhodes", "Standard Room", BB, 1208, {"double": 604}, A5)

# --- Africa ---
add("Africa Hotel – Rhodes", "Standard Room", BB, 1268, {"double": 634, "single": 764, "triple": 604, "child1": 514}, J3)
add("Africa Hotel – Rhodes", "Standard Room", BB, 1308, {"double": 654, "single": 794, "triple": 634, "child1": 534}, A4)
add("Africa Hotel – Rhodes", "Standard Room", BB, 1208, {"double": 604, "single": 724, "triple": 584, "child1": 510}, ["31/08"])

# --- Europa ---
add("Europa Hotel – Rhodes", "Standard Room", BB, 1228, {"double": 614, "triple": 594, "child1": 504}, J3)
add("Europa Hotel – Rhodes", "Standard Room", BB, 1288, {"double": 644, "triple": 624, "child1": 534}, A5)

# --- Atlantis ---
add("Atlantis Boutique City Hotel & Spa – Rhodes", "Standard Room", BB, 1328, {"double": 664, "single": 954, "triple": 644, "child1": 534}, JUL13)
add(
    "Atlantis Boutique City Hotel & Spa – Rhodes",
    "Junior Suite",
    BB,
    1548,
    {"double": 774, "triple": 734, "child1": 584, "child2": 584},
    JUL13,
)
add(
    "Atlantis Boutique City Hotel & Spa – Rhodes",
    "Standard Room",
    BB,
    1428,
    {"double": 714, "single": 1044, "triple": 684, "child1": 554},
    JUL2,
)
add(
    "Atlantis Boutique City Hotel & Spa – Rhodes",
    "Junior Suite",
    BB,
    1588,
    {"double": 794, "triple": 754, "child1": 594, "child2": 594},
    JUL2,
)
add(
    "Atlantis Boutique City Hotel & Spa – Rhodes",
    "Standard Room",
    BB,
    1488,
    {"double": 744, "single": 1064, "triple": 704, "child1": 580},
    ["03/08", "10/08", "17/08"],
)
add(
    "Atlantis Boutique City Hotel & Spa – Rhodes",
    "Junior Suite",
    BB,
    1628,
    {"double": 814, "triple": 774, "child1": 614, "child2": 614},
    ["03/08", "10/08", "17/08"],
)
add(
    "Atlantis Boutique City Hotel & Spa – Rhodes",
    "Standard Room",
    BB,
    1388,
    {"double": 694, "single": 974, "triple": 664, "child1": 554},
    LAST2,
)
add(
    "Atlantis Boutique City Hotel & Spa – Rhodes",
    "Junior Suite",
    BB,
    1588,
    {"double": 794, "triple": 754, "child1": 604, "child2": 604},
    LAST2,
)

# --- Esperia ---
add("Esperia City Hotel – Rhodes", "Standard Room", BB, 1368, {"double": 684, "triple": 604, "child1": 474}, J3)
add("Esperia City Hotel – Rhodes", "Club Room", BB, 1508, {"double": 754, "triple": 654, "child1": 484}, J3)
add(
    "Esperia City Hotel – Rhodes",
    "One Bedroom",
    BB,
    1628,
    {"double": 814, "triple": 704, "child1": 474, "child2": 474},
    J3,
)
add("Esperia City Hotel – Rhodes", "Club Room", BB, 1548, {"double": 774, "triple": 684, "child1": 504}, A5)
add("Esperia City Hotel – Rhodes", "Standard Room", BB, 1408, {"double": 704, "triple": 634, "child1": 494}, A5)
add(
    "Esperia City Hotel – Rhodes",
    "One Bedroom",
    BB,
    1688,
    {"double": 844, "triple": 734, "child1": 494, "child2": 494},
    A5,
)

# --- Manousos ---
add(
    "Manousos City Hotel – Rhodes",
    "Standard Room",
    BB,
    1388,
    {"double": 694, "single": 924, "triple": 684, "child1": 674},
    J3,
)
add(
    "Manousos City Hotel – Rhodes",
    "Standard Room",
    BB,
    1408,
    {"double": 704, "single": 954, "triple": 694, "child1": 684},
    A5,
)

# --- Amphitryon ---
add(
    "Amphitryon Boutique Hotel – Rhodes",
    "Standard Room",
    BB,
    1408,
    {"double": 704, "single": 914, "triple": 694, "child1": 554, "child2": 554},
    LAST2,
)

# --- Belair ---
add(
    "Belair Beach Hotel – Rhodes",
    "Standard Room",
    HB,
    1448,
    {"double": 724, "single": 914, "triple": 694, "child1": 560},
    J3,
)
add(
    "Belair Beach Hotel – Rhodes",
    "Standard Room",
    HB,
    1708,
    {"double": 854, "single": 1034, "triple": 814, "child1": 634},
    A5,
)

# --- Lydia ---
add("Lydia Hotel – Rhodes", "Standard Room", HB, 1448, {"double": 724, "single": 924, "triple": 714}, J3)
add("Lydia Hotel – Rhodes", "Standard Room", HB, 1508, {"double": 754, "single": 944, "triple": 744}, A5)

# --- Semiramis ---
add(
    "Semiramis City Hotel – Rhodes",
    "Standard Room",
    BB,
    1508,
    {"double": 754, "single": 1014, "triple": 740, "child1": 574},
    J3,
)
add(
    "Semiramis City Hotel – Rhodes",
    "Standard Room",
    BB,
    1548,
    {"double": 774, "single": 1044, "triple": 764, "child1": 604},
    A5,
)

# --- Aquarium ---
add("Aquarium Hotel – Rhodes", "Standard Room", BB, 1508, {"double": 754, "single": 924}, J3)
add("Aquarium Hotel – Rhodes", "Sea View Room", BB, 1548, {"double": 774}, J3)
add("Aquarium Hotel – Rhodes", "Standard Room", BB, 1568, {"double": 784, "single": 944}, A5)
add("Aquarium Hotel – Rhodes", "Sea View Room", BB, 1608, {"double": 804}, A5)

# --- Ibiscus ---
add(
    "Ibiscus Hotel – Rhodes",
    "Standard Room",
    BB,
    1508,
    {"double": 754, "single": 1114, "triple": 714, "child1": 574},
    JUL13,
)
add(
    "Ibiscus Hotel – Rhodes",
    "Sea View Room",
    BB,
    1628,
    {"double": 814, "single": 1244, "triple": 774, "child1": 604},
    JUL13,
)
add(
    "Ibiscus Hotel – Rhodes",
    "Standard Room",
    BB,
    1568,
    {"double": 784, "single": 1184, "triple": 754, "child1": 584},
    JUL2,
)
add(
    "Ibiscus Hotel – Rhodes",
    "Sea View Room",
    BB,
    1688,
    {"double": 844, "single": 1294, "triple": 804, "child1": 614},
    JUL2,
)
add(
    "Ibiscus Hotel – Rhodes",
    "Standard Room",
    BB,
    1628,
    {"double": 814, "single": 1214, "triple": 774, "child1": 614},
    ["03/08", "10/08", "17/08"],
)
add(
    "Ibiscus Hotel – Rhodes",
    "Sea View Room",
    BB,
    1728,
    {"double": 864, "single": 1324, "triple": 824, "child1": 644},
    ["03/08", "10/08", "17/08"],
)
add(
    "Ibiscus Hotel – Rhodes",
    "Standard Room",
    BB,
    1548,
    {"double": 774, "single": 1144, "triple": 744, "child1": 594},
    LAST2,
)
add(
    "Ibiscus Hotel – Rhodes",
    "Sea View Room",
    BB,
    1688,
    {"double": 844, "single": 1164, "triple": 794, "child1": 624},
    LAST2,
)

# --- Rhodes Palace ---
RP = "Rhodes Palace Luxury Convention Resort  Hotel – Rhodes"
add(RP, "Executive Sea View Room", HB, 1518, {"double": 759, "single": 979, "triple": 729, "child1": 579}, PAL_PAIR)
add(RP, "Premium Sea View Room", HB, 1598, {"double": 799, "single": 1039, "triple": 759, "child1": 599}, PAL_PAIR)
add(RP, "Family Room", HB, 1858, {"double": 929, "child1": 549, "child2": 549}, FAM_DATES)
add(RP, "Premium Sea View Room", HB, 1818, {"double": 909, "single": 1219, "triple": 859, "child1": 659}, MID4)
add(RP, "Executive Sea View Room", HB, 1658, {"double": 829, "single": 1079, "triple": 779, "child1": 609}, MID4)

# --- Dionysos ---
add("Dionysos Hotel – Rhodes", "Standard Room", BB, 1648, {"double": 824, "triple": 784, "child1": 694}, J3)
add("Dionysos Hotel – Rhodes", "Standard Room", BB, 1708, {"double": 854, "triple": 804, "child1": 714}, AUG24)
add("Dionysos Hotel – Rhodes", "Standard Room", BB, 1524, {"double": 762, "triple": 724, "child1": 664}, ["31/08"])

# --- Blue Sky ---
add("Blue Sky City Beach Hotel – Rhodes", "Standard Room", HB, 1524, {"double": 762, "single": 894}, J3)
add("Blue Sky City Beach Hotel – Rhodes", "Standard Room", HB, 1568, {"double": 784, "single": 914}, A5)

# --- Blue Horizon ---
add("Blue Horizon Hotel – Rhodes", "Standard Room", HB, 1528, {"double": 764}, J3)
add("Blue Horizon Hotel – Rhodes", "Sea View Room", HB, 1608, {"double": 804}, J3)
add("Blue Horizon Hotel – Rhodes", "Standard Room", HB, 1588, {"double": 794}, A5)
add("Blue Horizon Hotel – Rhodes", "Sea View Room", HB, 1668, {"double": 834}, A5)

# --- Mediterranean ---
add(
    "Mediterranean Hotel – Rhodes",
    "Standard Room",
    HB,
    1528,
    {"double": 764, "single": 994, "triple": 724, "child1": 574},
    J3,
)
add(
    "Mediterranean Hotel – Rhodes",
    "City View",
    HB,
    1588,
    {"double": 794, "single": 1034, "triple": 754, "child1": 594},
    J3,
)
add(
    "Mediterranean Hotel – Rhodes",
    "Sea View",
    HB,
    1708,
    {"double": 854, "single": 1134, "triple": 804, "child1": 624},
    J3,
)
add(
    "Mediterranean Hotel – Rhodes",
    "City View",
    HB,
    1628,
    {"double": 814, "single": 1054, "triple": 774, "child1": 614},
    A5,
)
add(
    "Mediterranean Hotel – Rhodes",
    "Standard Room",
    HB,
    1568,
    {"double": 784, "single": 1014, "triple": 744, "child1": 604},
    A5,
)
add(
    "Mediterranean Hotel – Rhodes",
    "Sea View",
    HB,
    1748,
    {"double": 874, "single": 1154, "triple": 834, "child1": 644},
    A5,
)

# --- Cactus ---
add("Cactus Hotel – Rhodes", "Standard Room", BB, 1548, {"double": 774, "single": 1144}, J3)
add("Cactus Hotel – Rhodes", "Sea View Room", BB, 1568, {"double": 784, "single": 1174}, J3)
add("Cactus Hotel – Rhodes", "Standard Room", BB, 1588, {"double": 794, "single": 1174}, A5)
add("Cactus Hotel – Rhodes", "Sea View Room", BB, 1620, {"double": 810, "single": 1204}, A5)

# --- Plaza ---
add("Plaza Hotel – Rhodes", "Standard Room", HB, 1628, {"double": 814, "triple": 774, "child1": 604}, J3)
add("Plaza Hotel – Rhodes", "Standard Room", HB, 1788, {"double": 894, "triple": 844, "child1": 654}, A5)

# --- Castellum ---
add(
    "Castellum Suites Hotel – Rhodes",
    "Standard Room",
    AI,
    1728,
    {"double": 864, "triple": 644, "child1": 624},
    JUL13,
)
add(
    "Castellum Suites Hotel – Rhodes",
    "Executive Suite",
    AI,
    1848,
    {"double": 924, "triple": 870, "child1": 654, "child2": 654},
    JUL13,
)
add(
    "Castellum Suites Hotel – Rhodes",
    "Standard Room",
    AI,
    1808,
    {"double": 904, "triple": 854, "child1": 644},
    JUL2,
)
add(
    "Castellum Suites Hotel – Rhodes",
    "Executive Suite",
    AI,
    1928,
    {"double": 964, "triple": 904, "child1": 674, "child2": 674},
    JUL2,
)
add(
    "Castellum Suites Hotel – Rhodes",
    "Standard Room",
    AI,
    1848,
    {"double": 924, "triple": 874, "child1": 674},
    ["03/08", "10/08", "17/08"],
)
add(
    "Castellum Suites Hotel – Rhodes",
    "Executive Suite",
    AI,
    1968,
    {"double": 984, "triple": 934, "child1": 704, "child2": 704},
    ["03/08", "10/08", "17/08"],
)
add(
    "Castellum Suites Hotel – Rhodes",
    "Standard Room",
    AI,
    1768,
    {"double": 884, "triple": 664, "child1": 644},
    LAST2,
)
add(
    "Castellum Suites Hotel – Rhodes",
    "Executive Suite",
    AI,
    1908,
    {"double": 954, "triple": 894, "child1": 684, "child2": 684},
    LAST2,
)

# --- Sun Beach ---
add(
    "Sun Beach Resort Complex – Rhodes",
    "Superior Room",
    HB,
    1968,
    {"double": 984, "triple": 922, "child1": 394, "child2": 684},
    J3,
)
add(
    "Sun Beach Resort Complex – Rhodes",
    "Superior Room",
    HB,
    2008,
    {"double": 1004, "triple": 944, "child1": 414, "child2": 704},
    A5,
)

# --- Rodos Palladium ---
add("Rodos Palladium – Rhodes", "Standard Room", HB, 2108, {"double": 1054, "triple": 984, "child1": 714}, JUL13)
add("Rodos Palladium – Rhodes", "Standard Room", HB, 2168, {"double": 1084, "triple": 1012, "child1": 734}, JUL2)
add("Rodos Palladium – Rhodes", "Standard Room", HB, 2208, {"double": 1104, "triple": 1034, "child1": 764}, AUG24)
add("Rodos Palladium – Rhodes", "Standard Room", HB, 2088, {"double": 1044, "triple": 984, "child1": 724}, ["31/08"])

# --- Eden Roc ---
add(
    "Eden Roc Resort Hotel – Rhodes",
    "Garden View Room",
    AI,
    2488,
    {"double": 1244, "triple": 1174, "child1": 394},
    J3,
)
add(
    "Eden Roc Resort Hotel – Rhodes",
    "Garden View Room",
    AI,
    2548,
    {"double": 1274, "triple": 1194, "child1": 414},
    ["03/08", "10/08", "17/08"],
)
add(
    "Eden Roc Resort Hotel – Rhodes",
    "Garden View Room",
    AI,
    2288,
    {"double": 1144, "triple": 1084, "child1": 414},
    LAST2,
)


def main():
    header = (
        "// Hotel inventory for package 316 (Ρόδος · καλοκαίρι) — July/August departures.\n"
        "// Generated by scripts/generate_rhodes_package_316_hotels.py — re-run after tariff edits.\n"
        "export const rhodesPackage316Hotels = [\n"
    )
    body = ",\n".join(emit_obj(r) for r in rows)
    footer = "\n]\n"
    OUT.write_text(header + body + footer, encoding="utf-8")
    print(f"Wrote {OUT} ({len(rows)} rows)")


if __name__ == "__main__":
    main()
