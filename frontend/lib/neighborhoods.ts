export interface NeighborhoodMeta {
  value: string;
  label: string;
  lat: number;
  lng: number;
}

export const NEIGHBORHOODS: NeighborhoodMeta[] = [
  { value: "nachlaot",      label: "Nachlaot",       lat: 31.7812, lng: 35.2091 },
  { value: "rehavia",       label: "Rehavia",        lat: 31.7726, lng: 35.2124 },
  { value: "katamon",       label: "Katamon",        lat: 31.7593, lng: 35.2121 },
  { value: "talbia",        label: "Talbia",         lat: 31.7648, lng: 35.2139 },
  { value: "city_center",   label: "City Center",    lat: 31.7781, lng: 35.2244 },
  { value: "german_colony", label: "German Colony",  lat: 31.7567, lng: 35.2201 },
  { value: "baka",          label: "Baka",           lat: 31.7527, lng: 35.2220 },
  { value: "ramot",         label: "Ramot",          lat: 31.8220, lng: 35.1940 },
  { value: "pisgat_zeev",   label: "Pisgat Ze'ev",  lat: 31.8278, lng: 35.2440 },
  { value: "neve_yaacov",   label: "Neve Ya'acov",  lat: 31.8428, lng: 35.2388 },
  { value: "gilo",          label: "Gilo",           lat: 31.7297, lng: 35.1822 },
  { value: "har_homa",      label: "Har Homa",       lat: 31.7197, lng: 35.2047 },
  { value: "talpiot",       label: "Talpiot",        lat: 31.7503, lng: 35.2285 },
  { value: "arnona",        label: "Arnona",         lat: 31.7453, lng: 35.2204 },
  { value: "kiryat_yovel",  label: "Kiryat Yovel",  lat: 31.7680, lng: 35.1852 },
  { value: "ein_karem",     label: "Ein Karem",      lat: 31.7663, lng: 35.1608 },
  { value: "har_nof",       label: "Har Nof",        lat: 31.7835, lng: 35.1742 },
  { value: "beit_hakerem",  label: "Beit HaKerem",  lat: 31.7809, lng: 35.1890 },
  { value: "kiryat_moshe",  label: "Kiryat Moshe",  lat: 31.7870, lng: 35.1985 },
];

export const NEIGHBORHOOD_MAP = new Map(NEIGHBORHOODS.map((n) => [n.value, n]));
