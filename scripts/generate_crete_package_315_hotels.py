#!/usr/bin/env python3
"""Generate src/data/cretePackage315Hotels.js — package 315 Crete inventory."""

import json
from pathlib import Path

WEBP = "/images/greek-packages-summer/crete-summer-package"

# Prefer crete-summer-package webp where we have assets; else legacy /images/hotels PNG paths.
IMG = {
    "Kastro Hotel – Heraklion": "/images/hotels/kastro-hotel-heraklion.png",
    "Marin Hotel – Heraklion": "/images/hotels/marin-hotel-heraklion.png",
    "Vanisko Hotel – Ammoudara": "/images/hotels/vanisko-hotel-ammoudara.png",
    "Olympic Hotel – Heraklion": "/images/hotels/olympic-hotel-heraklion.png",
    "Castello City Hotel – Heraklion": "/images/hotels/castello-city-heraklion.png",
    "Olympic Palladium Hotel – Rethymno": "/images/hotels/olympic-palladium-rethymno.png",
    "Elounda Krini Hotel – Elounda": "/images/hotels/elounda-krini-elounda.png",
    "Lato Boutique Hotel – Heraklion": "/images/hotels/lato-boutique-heraklion.png",
    "Golden Beach Hotel – Hersonissos": "/images/hotels/golden-beach-hotel-hersonissos.png",
    "Galaxy Hotel – Heraklion": "/images/hotels/galaxy-hotel-heraklion.png",
    "Aquila Atlantis Hotel – Heraklion": "/images/hotels/aquila-atlantis-heraklion.png",
    "Hersonissos Maris Hotel – Hersonissos": "/images/hotels/hersonissos-maris-hersonissos.png",
    "Elounda Orama Hotel – Elounda": f"{WEBP}/Elounda-orama-hotel-elounda.webp",
    "Jo An Palace Hotel – Rethymno": "/images/hotels/jo-an-palace-rethymno.png",
    "Jo An Beach Hotel – Rethymno": f"{WEBP}/Jo-an-beach-hotel-rethymno.webp",
    "Marilena Hotel – Ammoudara": "/images/hotels/marilena-hotel-ammoudara.png",
    "Achillion Palace Hotel – Rethymno": f"{WEBP}/Achillion-palace-hotel-rethymno.webp",
    "Hersonissos Palace Hotel – Hersonissos": f"{WEBP}/Hersonissos-palace-hotel-hersonissos.webp",
    "Civitel Creta Beach Hotel – Ammoudara": f"{WEBP}/civitel-creta-beach-hotel-ammoudara.webp",
    "Minos Hotel – Rethymno": f"{WEBP}/minos-hotel-rethymno.webp",
    "Rimondi Boutique Hotel – Rethymno": f"{WEBP}/Rimondi-boutique-hotel-rethymno.webp",
    "Rethymno Mare Royal & Water Park Hotel – Rethymno": f"{WEBP}/Rethymno-mare-royal.webp",
    "Arminda Hotel & Spa – Hersonissos": f"{WEBP}/Arminda-hotel-spa-hersonissos.webp",
    "Aquilla Porto Rethymno Hotel – Rethymno": f"{WEBP}/Aquilla-porto-rethymno.webp",
    "Akasha Beach Hotel – Hersonissos": f"{WEBP}/Akasha-beach-hotel-hersonissos.webp",
    "Star Beach Village & Water Park Hotel – Hersonissos": f"{WEBP}/Star-beach-village-water-park-hotel-hersonissos.webp",
}

LOC = {
    "Kastro Hotel – Heraklion": "Theotokopoulou 22, 71202, Heraklion, Greece",
    "Marin Hotel – Heraklion": "Epimenidou 46, Heraklion, 71202, Heraklion, Greece",
    "Vanisko Hotel – Ammoudara": "7, Andrea Papandreou Street, Amoudara Herakliou, 71414, Heraklion, Greece",
    "Olympic Hotel – Heraklion": "Kornarou Square, Heraklio Town, 71201, Heraklion, Greece",
    "Castello City Hotel – Heraklion": "1, 62 Martyron Avenue, 71304, Heraklion, Greece",
    "Olympic Palladium Hotel – Rethymno": "42, Themistokli Moatsou str., Rethymno, 74100, Rethymno, Greece",
    "Elounda Krini Hotel – Elounda": "A. Papandreou, Elounda, 72053, Crete, Greece",
    "Lato Boutique Hotel – Heraklion": "15 Epimenidou Street, Heraklio Town, 71202, Heraklion, Greece",
    "Golden Beach Hotel – Hersonissos": "El. Venizelou 191, Limenas Hersonissou, 70014, Heraklion, Greece",
    "Galaxy Hotel – Heraklion": "75 Dimocratias Avenue, 71306, Heraklion, Greece",
    "Aquila Atlantis Hotel – Heraklion": "2, Ygias Str., Heraklio Town, 71202, Heraklion, Greece",
    "Hersonissos Maris Hotel – Hersonissos": "Limenas Hersonissou, 70014, Heraklion, Greece",
    "Elounda Orama Hotel – Elounda": "Andrea Papandreou 48 str., Elounda, Crete, Greece",
    "Jo An Palace Hotel – Rethymno": "8, Dimitrakaki str., Rethymno, Crete, 74100, Rethymno, Greece",
    "Jo An Beach Hotel – Rethymno": "8, Dimitrakaki str., Rethymno, Crete, 74100, Rethymno, Greece",
    "Marilena Hotel – Ammoudara": "Antrea Papandreou 173, Amoudara Herakliou, 71414, Heraklion, Greece",
    "Achillion Palace Hotel – Rethymno": "27 K. Giamboudaki, Rethymnon, Crete, 74100, Rethymno, Greece",
    "Hersonissos Palace Hotel – Hersonissos": "Dedalou 10, Limenas Hersonissou, Hersonissos, 70014, Heraklion, Greece",
    "Civitel Creta Beach Hotel – Ammoudara": "74, Andrea Papandreou str., Ammoudara, Gazi, Heraklion, 71414, Heraklion, Greece",
    "Minos Hotel – Rethymno": "5 Machiton Schollis Chorophilakis, Rethymno Town, 74100, Rethymno, Greece",
    "Rimondi Boutique Hotel – Rethymno": "Xanthoudidou 21, Rethymno, 74100, Rethymno, Greece",
    "Rethymno Mare Royal & Water Park Hotel – Rethymno": "Rethymno, Crete, Greece",
    "Arminda Hotel & Spa – Hersonissos": "Hersonissos, Crete, 70014, Heraklion, Greece",
    "Aquilla Porto Rethymno Hotel – Rethymno": "Sikelianou & Venizelou 52A, Rethymno, 74100, Rethymno, Greece",
    "Akasha Beach Hotel – Hersonissos": "183 El. Venizelou Str., Hersonissos, Heraklion, Crete, 70014, Greece",
    "Star Beach Village & Water Park Hotel – Hersonissos": "Themistokleous 3, Limenas Hersonissou, Hersonissos, 70014, Heraklion, Greece",
}

STARS = {
    "Kastro Hotel – Heraklion": 3,
    "Marin Hotel – Heraklion": 3,
    "Vanisko Hotel – Ammoudara": 3,
    "Olympic Hotel – Heraklion": 3,
    "Castello City Hotel – Heraklion": 4,
    "Olympic Palladium Hotel – Rethymno": 3,
    "Elounda Krini Hotel – Elounda": 4,
    "Lato Boutique Hotel – Heraklion": 3,
    "Golden Beach Hotel – Hersonissos": 4,
    "Galaxy Hotel – Heraklion": 5,
    "Aquila Atlantis Hotel – Heraklion": 5,
    "Hersonissos Maris Hotel – Hersonissos": 4,
    "Elounda Orama Hotel – Elounda": 4,
    "Jo An Palace Hotel – Rethymno": 4,
    "Jo An Beach Hotel – Rethymno": 4,
    "Marilena Hotel – Ammoudara": 4,
    "Achillion Palace Hotel – Rethymno": 4,
    "Hersonissos Palace Hotel – Hersonissos": 5,
    "Civitel Creta Beach Hotel – Ammoudara": 4,
    "Minos Hotel – Rethymno": 4,
    "Rimondi Boutique Hotel – Rethymno": 4,
    "Rethymno Mare Royal & Water Park Hotel – Rethymno": 4,
    "Arminda Hotel & Spa – Hersonissos": 4,
    "Aquilla Porto Rethymno Hotel – Rethymno": 5,
    "Akasha Beach Hotel – Hersonissos": 5,
    "Star Beach Village & Water Park Hotel – Hersonissos": 4,
}

BB = "Πρωινό"
HB = "Ημιδιατροφή"
AI = "All Inclusive"


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
    price_str = "{ " + ", ".join(f"{k}: {p[k]}" for k in ("double", "single", "triple", "child1", "child2") if k in p) + " }"
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


rows = []

J3 = ["13/07", "20/07", "27/07"]
A5 = ["03/08", "10/08", "17/08", "24/08", "31/08"]


def add_multi(name, room, board, j_dates, j_prices, j_pkg, a_dates, a_prices, a_pkg):
    for d in j_dates:
        rows.append(row(name, room, board, j_prices, j_pkg, d))
    for d in a_dates:
        rows.append(row(name, room, board, a_prices, a_pkg, d))


# --- Kastro ---
add_multi(
    "Kastro Hotel – Heraklion",
    "Standard Room",
    BB,
    J3,
    {"double": 564, "single": 684, "triple": 524, "child1": 394},
    1128,
    A5,
    {"double": 584, "single": 710, "triple": 554, "child1": 414},
    1168,
)

# --- Marin ---
add_multi(
    "Marin Hotel – Heraklion",
    "Standard Room",
    BB,
    J3,
    {"double": 604, "single": 734, "triple": 572, "child1": 484, "child2": 484},
    1208,
    A5,
    {"double": 624, "single": 764, "triple": 594, "child1": 504, "child2": 504},
    1248,
)

# --- Vanisko ---
add_multi(
    "Vanisko Hotel – Ammoudara",
    "Standard Room",
    BB,
    J3,
    {"double": 614, "single": 804, "triple": 574, "child1": 474},
    1228,
    A5,
    {"double": 640, "single": 834, "triple": 594, "child1": 494},
    1280,
)

# --- Olympic ---
add_multi(
    "Olympic Hotel – Heraklion",
    "Standard Room",
    BB,
    J3,
    {"double": 624, "single": 684, "triple": 544, "child1": 394, "child2": 394},
    1248,
    A5,
    {"double": 654, "single": 704, "triple": 564, "child1": 404, "child2": 404},
    1308,
)

# --- Castello ---
add_multi(
    "Castello City Hotel – Heraklion",
    "Standard Room",
    BB,
    J3,
    {"double": 629, "single": 809, "triple": 609, "child1": 545},
    1258,
    A5,
    {"double": 649, "single": 839, "triple": 629, "child1": 569},
    1298,
)

# --- Olympic Palladium ---
add_multi(
    "Olympic Palladium Hotel – Rethymno",
    "Standard Room",
    BB,
    J3,
    {"double": 684, "single": 890, "triple": 604, "child1": 524},
    1368,
    A5,
    {"double": 704, "single": 914, "triple": 634, "child1": 554},
    1408,
)

# --- Elounda Krini (complex dates) ---
ek = "Elounda Krini Hotel – Elounda"
# Standard — 13/07 only
rows.append(
    row(
        ek,
        "Standard Room",
        BB,
        {"double": 694, "triple": 644, "child1": 444},
        1388,
        "13/07",
    )
)
# Family — 13/07 only
rows.append(
    row(
        ek,
        "Family Room",
        BB,
        {"double": 894, "triple": 814, "child1": 444, "child2": 654},
        1788,
        "13/07",
    )
)
for d in ["20/07", "27/07"]:
    rows.append(
        row(
            ek,
            "Standard Room",
            BB,
            {"double": 724, "triple": 664, "child1": 444},
            1448,
            d,
        )
    )
    rows.append(
        row(
            ek,
            "Family Room",
            BB,
            {"double": 954, "triple": 874, "child1": 444, "child2": 704},
            1908,
            d,
        )
    )
for d in A5:
    rows.append(
        row(
            ek,
            "Standard Room",
            BB,
            {"double": 744, "triple": 684, "child1": 474},
            1488,
            d,
        )
    )
    rows.append(
        row(
            ek,
            "Family Room",
            BB,
            {"double": 974, "triple": 894, "child1": 474, "child2": 734},
            1948,
            d,
        )
    )

# --- Lato ---
lt = "Lato Boutique Hotel – Heraklion"
for d in J3:
    rows.append(
        row(
            lt,
            "Standard Room",
            BB,
            {"double": 724, "child1": 534},
            1448,
            d,
        )
    )
    rows.append(
        row(
            lt,
            "Superior Room",
            BB,
            {"double": 764, "triple": 724, "child1": 554},
            1528,
            d,
        )
    )
for d in A5:
    rows.append(
        row(
            lt,
            "Standard Room",
            BB,
            {"double": 754, "child1": 560},
            1508,
            d,
        )
    )
    rows.append(
        row(
            lt,
            "Superior Room",
            BB,
            {"double": 794, "triple": 750, "child1": 584},
            1588,
            d,
        )
    )

# --- Golden Beach ---
gb = "Golden Beach Hotel – Hersonissos"
add_multi(
    gb,
    "Standard Room",
    HB,
    J3,
    {"double": 734, "single": 960, "triple": 684, "child1": 354},
    1468,
    A5,
    {"double": 764, "single": 984, "triple": 704, "child1": 374},
    1528,
)
add_multi(
    gb,
    "Sea View Room",
    HB,
    J3,
    {"double": 812, "triple": 754, "child1": 354},
    1624,
    A5,
    {"double": 834, "triple": 774, "child1": 374},
    1668,
)

# --- Galaxy ---
add_multi(
    "Galaxy Hotel – Heraklion",
    "Standard Room",
    BB,
    J3,
    {"double": 744, "single": 1064, "triple": 710, "child1": 544},
    1488,
    A5,
    {"double": 774, "single": 1084, "triple": 734, "child1": 574},
    1548,
)

# --- Aquila Atlantis ---
add_multi(
    "Aquila Atlantis Hotel – Heraklion",
    "Standard Room",
    BB,
    J3,
    {"double": 744, "single": 980, "triple": 684, "child1": 344},
    1488,
    A5,
    {"double": 774, "single": 1004, "triple": 710, "child1": 374},
    1548,
)

# --- Hersonissos Maris ---
add_multi(
    "Hersonissos Maris Hotel – Hersonissos",
    "Standard Room",
    HB,
    J3,
    {"double": 764, "single": 1064, "triple": 714, "child1": 554},
    1528,
    A5,
    {"double": 790, "single": 1084, "triple": 734, "child1": 574},
    1580,
)

# --- Elounda Orama ---
eo = "Elounda Orama Hotel – Elounda"
rows.append(
    row(
        eo,
        "Standard Room",
        BB,
        {"double": 780, "triple": 714, "child1": 394},
        1560,
        "13/07",
    )
)
rows.append(
    row(
        eo,
        "Sea View Room",
        BB,
        {"double": 804, "triple": 734, "child1": 394},
        1608,
        "13/07",
    )
)
for d in ["20/07", "27/07"]:
    rows.append(
        row(
            eo,
            "Standard Room",
            BB,
            {"double": 850, "triple": 774, "child1": 394},
            1700,
            d,
        )
    )
    rows.append(
        row(
            eo,
            "Sea View Room",
            BB,
            {"double": 904, "triple": 824, "child1": 394},
            1808,
            d,
        )
    )
for d in A5:
    rows.append(
        row(
            eo,
            "Standard Room",
            BB,
            {"double": 874, "triple": 794, "child1": 414},
            1748,
            d,
        )
    )
    rows.append(
        row(
            eo,
            "Sea View Room",
            BB,
            {"double": 924, "triple": 844, "child1": 414},
            1848,
            d,
        )
    )

# --- Jo An Palace ---
add_multi(
    "Jo An Palace Hotel – Rethymno",
    "Standard Room",
    HB,
    J3,
    {"double": 794, "single": 1004, "triple": 724, "child1": 394},
    1588,
    A5,
    {"double": 814, "single": 1034, "triple": 744, "child1": 424},
    1628,
)

# --- Jo An Beach ---
jb = "Jo An Beach Hotel – Rethymno"
add_multi(
    jb,
    "Standard Room",
    HB,
    J3,
    {"double": 794, "single": 974, "triple": 724, "child1": 394},
    1588,
    A5,
    {"double": 824, "single": 1000, "triple": 754, "child1": 414},
    1648,
)
add_multi(
    jb,
    "Family Room",
    HB,
    J3,
    {"double": 844, "triple": 764, "child1": 394, "child2": 594},
    1688,
    A5,
    {"double": 864, "triple": 794, "child1": 414, "child2": 614},
    1728,
)

# --- Marilena ---
add_multi(
    "Marilena Hotel – Ammoudara",
    "Standard Room",
    AI,
    J3,
    {"double": 800, "single": 1064, "triple": 744, "child1": 354, "child2": 554},
    1600,
    A5,
    {"double": 824, "single": 1094, "triple": 764, "child1": 374, "child2": 594},
    1648,
)

# --- Achillion ---
add_multi(
    "Achillion Palace Hotel – Rethymno",
    "Standard Room",
    BB,
    J3,
    {"double": 802, "single": 1044, "triple": 704, "child1": 584},
    1604,
    A5,
    {"double": 824, "single": 1074, "triple": 724, "child1": 604},
    1648,
)

# --- Hersonissos Palace (3 date tiers) ---
hp = "Hersonissos Palace Hotel – Hersonissos"
for d in J3:
    rows.append(
        row(
            hp,
            "Standard Room",
            AI,
            {"double": 924, "single": 1264, "triple": 854, "child1": 624},
            1848,
            d,
        )
    )
for d in ["03/08", "10/08", "17/08"]:
    rows.append(
        row(
            hp,
            "Standard Room",
            AI,
            {"double": 950, "single": 1294, "triple": 880, "child1": 654},
            1900,
            d,
        )
    )
for d in ["24/08", "31/08"]:
    rows.append(
        row(
            hp,
            "Standard Room",
            AI,
            {"double": 854, "single": 1130, "triple": 794, "child1": 604},
            1708,
            d,
        )
    )

# --- Civitel Creta Beach ---
cc = "Civitel Creta Beach Hotel – Ammoudara"
for d in J3:
    rows.append(
        row(
            cc,
            "Standard Room",
            BB,
            {"double": 904, "single": 1364, "triple": 834, "child1": 624},
            1808,
            d,
        )
    )
    rows.append(
        row(
            cc,
            "Family Room",
            BB,
            {"double": 944, "triple": 870, "child1": 644, "child2": 644},
            1888,
            d,
        )
    )
for d in ["03/08", "10/08", "17/08"]:
    rows.append(
        row(
            cc,
            "Standard Room",
            BB,
            {"double": 934, "single": 1384, "triple": 860, "child1": 644},
            1868,
            d,
        )
    )
    rows.append(
        row(
            cc,
            "Family Room",
            BB,
            {"double": 974, "triple": 894, "child1": 664, "child2": 664},
            1948,
            d,
        )
    )
for d in ["24/08", "31/08"]:
    rows.append(
        row(
            cc,
            "Standard Room",
            BB,
            {"double": 884, "single": 1294, "triple": 814, "child1": 624},
            1768,
            d,
        )
    )
    rows.append(
        row(
            cc,
            "Family Room",
            BB,
            {"double": 914, "triple": 854, "child1": 644, "child2": 644},
            1828,
            d,
        )
    )

# --- Minos ---
add_multi(
    "Minos Hotel – Rethymno",
    "Superior Junior Suite",
    BB,
    J3,
    {"double": 950, "triple": 864, "child1": 394, "child2": 664},
    1900,
    A5,
    {"double": 974, "triple": 884, "child1": 414, "child2": 684},
    1948,
)

# --- Rimondi ---
add_multi(
    "Rimondi Boutique Hotel – Rethymno",
    "Standard Room",
    BB,
    J3,
    {"double": 954, "single": 1484, "triple": 834, "child1": 564},
    1908,
    A5,
    {"double": 974, "single": 1504, "triple": 854, "child1": 584},
    1948,
)

# --- Rethymno Mare Royal ---
rm = "Rethymno Mare Royal & Water Park Hotel – Rethymno"
add_multi(
    rm,
    "Superior Room Sea View",
    HB,
    J3,
    {"double": 1044, "child1": 704},
    2088,
    A5,
    {"double": 1074, "child1": 734},
    2148,
)

# --- Arminda ---
ar = "Arminda Hotel & Spa – Hersonissos"
add_multi(
    ar,
    "Standard Room",
    AI,
    J3,
    {"double": 1044, "triple": 980, "child1": 574},
    2088,
    A5,
    {"double": 1064, "triple": 1004, "child1": 594},
    2128,
)
add_multi(
    ar,
    "Family Room",
    AI,
    J3,
    {"double": 1114, "triple": 1014, "child1": 644, "child2": 644},
    2228,
    A5,
    {"double": 1134, "triple": 1044, "child1": 674, "child2": 674},
    2268,
)

# --- Aquilla Porto (3 tiers) ---
ap = "Aquilla Porto Rethymno Hotel – Rethymno"
rows.append(
    row(
        ap,
        "Standard Room",
        BB,
        {"double": 1054, "triple": 914, "child1": 704},
        2108,
        "13/07",
    )
)
for d in ["20/07", "27/07"]:
    rows.append(
        row(
            ap,
            "Standard Room",
            BB,
            {"double": 1104, "triple": 954, "child1": 734},
            2208,
            d,
        )
    )
for d in A5:
    rows.append(
        row(
            ap,
            "Standard Room",
            BB,
            {"double": 1134, "triple": 984, "child1": 760},
            2268,
            d,
        )
    )

# --- Akasha ---
add_multi(
    "Akasha Beach Hotel – Hersonissos",
    "Standard Room",
    HB,
    J3,
    {"double": 1104, "single": 1540, "triple": 1012, "child1": 354},
    2208,
    A5,
    {"double": 1124, "single": 1564, "triple": 1034, "child1": 374},
    2248,
)

# --- Star Beach ---
add_multi(
    "Star Beach Village & Water Park Hotel – Hersonissos",
    "Standard Room",
    AI,
    J3,
    {"double": 1304, "single": 1934, "triple": 1194, "child1": 354, "child2": 824},
    2608,
    A5,
    {"double": 1324, "single": 1960, "triple": 1214, "child1": 380, "child2": 844},
    2648,
)

out = ["// Hotel inventory & tariffs for package 315 (Κρήτη – 5 Μέρες) — July/August departures."]
out.append("// Generated by scripts/generate_crete_package_315_hotels.py — do not hand-edit without re-running.")
out.append("export const cretePackage315Hotels = [")
out.append(",\n".join(emit_obj(r) for r in rows))
out.append("]")
out.append("")

ROOT = Path(__file__).resolve().parents[1]
(ROOT / "src/data/cretePackage315Hotels.js").write_text("\n".join(out), encoding="utf-8")
print(f"Wrote {len(rows)} hotel rows")
