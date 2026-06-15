#!/usr/bin/env python3
"""Generate src/data/rhodesPackage321Hotels.js — Rhodes 8-day / 7-night July–August catalogue (package 321)."""

import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src/data/rhodesPackage321Hotels.js"
WEBP = "/images/greek-packages-summer/rhodes"
NIGHTS = 7

IMG = {
    "Nafsika Hotel – Rhodes": f"{WEBP}/nafsika-hotel.webp",
    "Africa Hotel – Rhodes": f"{WEBP}/africa-hotel.webp",
    "Europa Hotel – Rhodes": f"{WEBP}/europa-hotel.webp",
    "Atlantis Boutique City Hotel & Spa – Rhodes": f"{WEBP}/atlantis-hotel.webp",
    "Esperia City Hotel – Rhodes": f"{WEBP}/esperia-hotel.webp",
    "Manousos City Hotel – Rhodes": f"{WEBP}/manousos-hotel.webp",
    "Amphitryon Boutique Hotel – Rhodes": f"{WEBP}/amphitryon-boutique-hotel.webp",
    "Lydia Hotel – Rhodes": f"{WEBP}/lydia-hotel.webp",
    "Semiramis City Hotel – Rhodes": f"{WEBP}/semiramis-hotel.webp",
    "Aquarium Hotel – Rhodes": f"{WEBP}/aquarium-hotel-rhodes.webp",
    "Ibiscus Hotel – Rhodes": f"{WEBP}/imbiscus-hotel-rhodes.webp",
    "Rhodes Palace Luxury Convention Resort  Hotel – Rhodes": f"{WEBP}/rhodes-summer-greece-cover.webp",
    "Dionysos Hotel – Rhodes": f"{WEBP}/dionysos-hotel.webp",
    "Blue Sky City Beach Hotel – Rhodes": f"{WEBP}/blue-sky-hotel-rhodes.webp",
    "Blue Horizon Hotel – Rhodes": f"{WEBP}/blue-horizon-hotel.webp",
    "Cactus Hotel – Rhodes": f"{WEBP}/cactus-hotel.webp",
    "Plaza Hotel – Rhodes": f"{WEBP}/plaza-hotel.webp",
    "Castellum Suites Hotel – Rhodes": f"{WEBP}/castellum-hotel.webp",
    "Sun Beach Resort Complex – Rhodes": f"{WEBP}/sun-beach-resort.webp",
    "Rodos Palladium – Rhodes": f"{WEBP}/rhodes-palladium.webp",
}

LOC = {
    "Nafsika Hotel – Rhodes": "8, Parodiakou Sillogou Amerikis Str, 85100, Rhodes, Greece",
    "Africa Hotel – Rhodes": "Alexandrou Diacou Str. 63, 85100, Rhodes, Greece",
    "Europa Hotel – Rhodes": "94, 28th October str, 85100, Rhodes, Greece",
    "Atlantis Boutique City Hotel & Spa – Rhodes": "29 Ionos Dragoumi Str., 85100, Rhodes, Greece",
    "Esperia City Hotel – Rhodes": "7, G.Griva str., Rhodes Town, 85100, Rhodes, Greece",
    "Manousos City Hotel – Rhodes": "G.Leontos 25, Rhodes Town, 85100, Rhodes, Greece",
    "Amphitryon Boutique Hotel – Rhodes": "Alexandrou Diakou 10, Rhodes, 85100, Rhodes, Greece",
    "Lydia Hotel – Rhodes": "31, 25th March str., Rhodes Town, 85100, Rhodes, Greece",
    "Semiramis City Hotel – Rhodes": "18 Ioanni Metaxa Street, 85100, Rhodes, Greece",
    "Aquarium Hotel – Rhodes": "G. Haritou Sq. P.C, 85131, Rhodes, Greece",
    "Ibiscus Hotel – Rhodes": "17, Nisirou str., Rhodes Town, 85100, Rhodes, Greece",
    "Rhodes Palace Luxury Convention Resort  Hotel – Rhodes": "Trianton Avenue, Ixia, 85100, Rhodes, Greece",
    "Dionysos Hotel – Rhodes": "Iliadon 4, Main Street Ixia, 85100, Rhodes, Greece",
    "Blue Sky City Beach Hotel – Rhodes": "Rhodes Town, Rhodes, Greece",
    "Blue Horizon Hotel – Rhodes": "Ferenikis - Beach Of Ialyssos, 85101, Rhodes, Greece",
    "Cactus Hotel – Rhodes": "14 Kos Street, 85131, Rhodes, Greece",
    "Plaza Hotel – Rhodes": "Ierou Lochou Str., Rhodes Town, 85100, Rhodes, Greece",
    "Castellum Suites Hotel – Rhodes": "Ag.Ioannou 8, Nea Poli, 85100, Rhodes, Greece",
    "Sun Beach Resort Complex – Rhodes": "Ialysos Beach, 85101, Rhodes, Greece",
    "Rodos Palladium – Rhodes": "Faliraki - Kallithea beach, 85100, Rhodes, Greece",
}

STARS = {
    "Nafsika Hotel – Rhodes": 2,
    "Africa Hotel – Rhodes": 2,
    "Europa Hotel – Rhodes": 3,
    "Atlantis Boutique City Hotel & Spa – Rhodes": 3,
    "Esperia City Hotel – Rhodes": 3,
    "Manousos City Hotel – Rhodes": 3,
    "Amphitryon Boutique Hotel – Rhodes": 4,
    "Lydia Hotel – Rhodes": 2,
    "Semiramis City Hotel – Rhodes": 4,
    "Aquarium Hotel – Rhodes": 4,
    "Ibiscus Hotel – Rhodes": 4,
    "Rhodes Palace Luxury Convention Resort  Hotel – Rhodes": 5,
    "Dionysos Hotel – Rhodes": 4,
    "Blue Sky City Beach Hotel – Rhodes": 4,
    "Blue Horizon Hotel – Rhodes": 4,
    "Cactus Hotel – Rhodes": 3,
    "Plaza Hotel – Rhodes": 4,
    "Castellum Suites Hotel – Rhodes": 4,
    "Sun Beach Resort Complex – Rhodes": 4,
    "Rodos Palladium – Rhodes": 5,
}

BB = "Bed and Breakfast"
HB = "Half Board"
AI = "All Inclusive"

JUL3 = ["10/07", "17/07", "24/07"]
AUG3 = ["07/08", "14/08", "21/08"]
ALL6 = ["10/07", "17/07", "24/07", "07/08", "14/08", "21/08"]
JUL1 = ["10/07"]
MID5 = ["17/07", "24/07", "07/08", "14/08", "21/08"]
AUG4 = ["24/07", "07/08", "14/08", "21/08"]
AUG1 = ["21/08"]
CAST_A = ["10/07", "21/08"]
CAST_B = ["17/07", "24/07", "07/08", "14/08"]
PAL_A = ["10/07"]
PAL_B = ["17/07", "24/07", "07/08", "14/08", "21/08"]


def j(x):
    return json.dumps(x, ensure_ascii=False)


def row(name, room, board, prices, pkg, dep):
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
        "nights": NIGHTS,
    }


def emit_obj(r):
    p = r["prices"]
    keys = [k for k in ("double", "single", "triple", "quadruple", "child1", "child2") if k in p]
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

# Nafsika
add("Nafsika Hotel – Rhodes", "Standard Room", BB, 1258, {"double": 629}, JUL3)
add("Nafsika Hotel – Rhodes", "Standard Room", BB, 1348, {"double": 674}, AUG3)

# Europa
add("Europa Hotel – Rhodes", "Standard Room", BB, 1408, {"double": 704, "triple": 670, "child1": 514}, ALL6)

# Africa
add("Africa Hotel – Rhodes", "Standard Room", BB, 1448, {"double": 724, "single": 960, "triple": 684, "child1": 514}, ALL6)

# Atlantis
add(
    "Atlantis Boutique City Hotel & Spa – Rhodes",
    "Standard Room",
    BB,
    1588,
    {"double": 794, "single": 1284, "triple": 744, "child1": 550},
    JUL1,
)
add(
    "Atlantis Boutique City Hotel & Spa – Rhodes",
    "Junior Suite",
    BB,
    1948,
    {"double": 974, "triple": 904, "child1": 644, "child2": 644},
    JUL1,
)
add(
    "Atlantis Boutique City Hotel & Spa – Rhodes",
    "Standard Room",
    BB,
    1748,
    {"double": 874, "single": 1454, "triple": 824, "child1": 594},
    MID5,
)
add(
    "Atlantis Boutique City Hotel & Spa – Rhodes",
    "Junior Suite",
    BB,
    2008,
    {"double": 1004, "triple": 940, "child1": 654, "child2": 654},
    MID5,
)

# Manousos
add(
    "Manousos City Hotel – Rhodes",
    "Standard Room",
    BB,
    1628,
    {"double": 814, "single": 1244, "triple": 794, "child1": 794},
    ALL6,
)

# Amphitryon
add(
    "Amphitryon Boutique Hotel – Rhodes",
    "Standard Room",
    BB,
    1628,
    {"double": 814, "single": 1194, "triple": 804, "child1": 564, "child2": 564},
    AUG1,
)

# Esperia
add("Esperia City Hotel – Rhodes", "Standard Room", BB, 1628, {"double": 814, "triple": 684, "child1": 444}, ALL6)
add("Esperia City Hotel – Rhodes", "Club Room", BB, 1868, {"double": 934, "triple": 770, "child1": 440}, ALL6)
add(
    "Esperia City Hotel – Rhodes",
    "One Bedroom",
    BB,
    2128,
    {"double": 1064, "triple": 854, "child1": 444, "child2": 444},
    ALL6,
)

# Semiramis
add(
    "Semiramis City Hotel – Rhodes",
    "Standard Room",
    BB,
    1728,
    {"double": 864, "single": 1314, "triple": 804, "child1": 584},
    JUL1,
)
add(
    "Semiramis City Hotel – Rhodes",
    "Standard Room",
    BB,
    1880,
    {"double": 940, "single": 1404, "triple": 914, "child1": 624},
    MID5,
)

# Lydia
add("Lydia Hotel – Rhodes", "Standard Room", HB, 1800, {"double": 900, "single": 1234, "triple": 880}, ALL6)

# Rhodes Palace
add(
    "Rhodes Palace Luxury Convention Resort  Hotel – Rhodes",
    "Executive Sea View Room",
    HB,
    1850,
    {"double": 925, "single": 1299, "triple": 869, "child1": 609},
    ["10/07", "17/07"],
)
add(
    "Rhodes Palace Luxury Convention Resort  Hotel – Rhodes",
    "Premium Sea View Room",
    HB,
    1978,
    {"double": 989, "single": 1419, "triple": 925, "child1": 639},
    ["10/07", "17/07"],
)
add(
    "Rhodes Palace Luxury Convention Resort  Hotel – Rhodes",
    "Family Room",
    HB,
    2358,
    {"double": 1179, "child1": 589, "child2": 589},
    ALL6,
)
add(
    "Rhodes Palace Luxury Convention Resort  Hotel – Rhodes",
    "Premium Sea View Room",
    HB,
    2358,
    {"double": 1179, "single": 1729, "triple": 1099, "child1": 739},
    AUG4,
)
add(
    "Rhodes Palace Luxury Convention Resort  Hotel – Rhodes",
    "Executive Sea View Room",
    HB,
    2078,
    {"double": 1039, "single": 1485, "triple": 959, "child1": 659},
    AUG4,
)

# Ibiscus
add(
    "Ibiscus Hotel – Rhodes",
    "Standard Room",
    BB,
    1868,
    {"double": 934, "single": 1574, "triple": 880, "child1": 624},
    JUL1,
)
add(
    "Ibiscus Hotel – Rhodes",
    "Sea View Room",
    BB,
    2108,
    {"double": 1054, "single": 1794, "triple": 974, "child1": 674},
    JUL1,
)
add(
    "Ibiscus Hotel – Rhodes",
    "Standard Room",
    BB,
    2008,
    {"double": 1004, "single": 1700, "triple": 940, "child1": 654},
    MID5,
)
add(
    "Ibiscus Hotel – Rhodes",
    "Sea View Room",
    BB,
    2188,
    {"double": 1094, "single": 1894, "triple": 1024, "child1": 704},
    MID5,
)

# Dionysos
add(
    "Dionysos Hotel – Rhodes",
    "Standard Room",
    BB,
    1888,
    {"double": 944, "triple": 884, "child1": 754, "child2": 754},
    JUL1,
)
add(
    "Dionysos Hotel – Rhodes",
    "Standard Room",
    BB,
    2128,
    {"double": 1064, "triple": 994, "child1": 844, "child2": 844},
    MID5,
)

# Blue Sky
add("Blue Sky City Beach Hotel – Rhodes", "Standard Room", HB, 1908, {"double": 954, "single": 1184}, ALL6)

# Aquarium
add("Aquarium Hotel – Rhodes", "Standard Room", BB, 1908, {"double": 954, "single": 1244}, ALL6)
add("Aquarium Hotel – Rhodes", "Sea View Room", BB, 1968, {"double": 984}, ALL6)

# Blue Horizon
add("Blue Horizon Hotel – Rhodes", "Standard Room", HB, 1928, {"double": 964}, ALL6)
add("Blue Horizon Hotel – Rhodes", "Sea View Room", HB, 2068, {"double": 1034}, ALL6)

# Cactus
add("Cactus Hotel – Rhodes", "Standard Room", BB, 1948, {"double": 974, "single": 1634}, ALL6)
add("Cactus Hotel – Rhodes", "Sea View Room", BB, 1988, {"double": 994, "single": 1684}, ALL6)

# Plaza
add("Plaza Hotel – Rhodes", "Standard Room", HB, 2100, {"double": 1050, "triple": 974, "child1": 674}, JUL3)
add("Plaza Hotel – Rhodes", "Standard Room", BB, 2288, {"double": 1144, "triple": 1064, "child1": 724}, AUG3)

# Castellum
add("Castellum Suites Hotel – Rhodes", "Standard Room", AI, 2268, {"double": 1134, "triple": 744, "child1": 714}, CAST_A)
add(
    "Castellum Suites Hotel – Rhodes",
    "Executive Suite",
    AI,
    2480,
    {"double": 1240, "triple": 1144, "child1": 770, "child2": 770},
    CAST_A,
)
add("Castellum Suites Hotel – Rhodes", "Standard Room", AI, 2408, {"double": 1204, "triple": 1114, "child1": 754}, CAST_B)
add(
    "Castellum Suites Hotel – Rhodes",
    "Executive Suite",
    AI,
    2620,
    {"double": 1310, "triple": 1210, "child1": 810, "child2": 810},
    CAST_B,
)

# Sun Beach
add(
    "Sun Beach Resort Complex – Rhodes",
    "Standard Room",
    HB,
    2668,
    {"double": 1334, "triple": 1234, "child1": 304, "child2": 824},
    ALL6,
)

# Rodos Palladium
add("Rodos Palladium – Rhodes", "Garden View Room", HB, 2868, {"double": 1434, "triple": 1324, "child1": 870}, PAL_A)
add("Rodos Palladium – Rhodes", "Garden View Room", HB, 3028, {"double": 1514, "triple": 1394, "child1": 910}, PAL_B)


def main():
    header = (
        "// Hotel inventory for package 321 (ΡΟΔΟΣ · 8 Μέρες) — July/August departures, 7 nights.\n"
        "// Generated by scripts/generate_rhodes_package_321_hotels.py — re-run after tariff edits.\n"
        "export const rhodesPackage321Hotels = [\n"
    )
    body = ",\n".join(emit_obj(r) for r in rows)
    footer = "\n]\n"
    OUT.write_text(header + body + footer, encoding="utf-8")
    print(f"Wrote {OUT} ({len(rows)} rows)")


if __name__ == "__main__":
    main()
