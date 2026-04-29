from typing import Dict, Tuple

# Approximate center coordinates for each Jerusalem neighborhood
# (latitude, longitude)
NEIGHBORHOOD_CENTERS: Dict[str, Tuple[float, float]] = {
    "nachlaot":      (31.7812, 35.2091),
    "rehavia":       (31.7726, 35.2124),
    "katamon":       (31.7593, 35.2121),
    "talbia":        (31.7648, 35.2139),
    "city_center":   (31.7781, 35.2244),
    "german_colony": (31.7567, 35.2201),
    "baka":          (31.7527, 35.2220),
    "ramot":         (31.8220, 35.1940),
    "pisgat_zeev":   (31.8278, 35.2440),
    "neve_yaacov":   (31.8428, 35.2388),
    "gilo":          (31.7297, 35.1822),
    "har_homa":      (31.7197, 35.2047),
    "talpiot":       (31.7503, 35.2285),
    "arnona":        (31.7453, 35.2204),
    "kiryat_yovel":  (31.7680, 35.1852),
    "ein_karem":     (31.7663, 35.1608),
    "har_nof":       (31.7835, 35.1742),
    "beit_hakerem":  (31.7809, 35.1890),
    "kiryat_moshe":  (31.7870, 35.1985),
}

NEIGHBORHOOD_DISPLAY_NAMES: Dict[str, str] = {
    "nachlaot":      "Nachlaot",
    "rehavia":       "Rehavia",
    "katamon":       "Katamon",
    "talbia":        "Talbia",
    "city_center":   "City Center",
    "german_colony": "German Colony",
    "baka":          "Baka",
    "ramot":         "Ramot",
    "pisgat_zeev":   "Pisgat Ze'ev",
    "neve_yaacov":   "Neve Ya'acov",
    "gilo":          "Gilo",
    "har_homa":      "Har Homa",
    "talpiot":       "Talpiot",
    "arnona":        "Arnona",
    "kiryat_yovel":  "Kiryat Yovel",
    "ein_karem":     "Ein Karem",
    "har_nof":       "Har Nof",
    "beit_hakerem":  "Beit HaKerem",
    "kiryat_moshe":  "Kiryat Moshe",
}
