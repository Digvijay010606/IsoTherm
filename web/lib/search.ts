import type { Place } from "./types";

const KIND_RANK: Record<string, number> = {
  park: 0,
  university: 0,
  hospital: 0,
  school: 1,
  college: 1,
  library: 1,
  "community centre": 1,
  "place of worship": 2,
  road: 2,
  hotel: 3,
  office: 3,
  building: 4,
  apartments: 4,
  commercial: 4,
  restaurant: 5,
  cafe: 5,
  bar: 5,
  "fast food": 5,
  parking: 6,
};

const DEFAULT_KIND_RANK = 3;

function kindRank(kind: string) {
  return KIND_RANK[kind] ?? DEFAULT_KIND_RANK;
}

function matchTier(name: string, query: string) {
  if (name === query) return 0;
  if (name.startsWith(query)) return 1;
  if (name.split(/[\s\-/]+/).some((word) => word.startsWith(query))) return 2;
  if (name.includes(query)) return 3;
  return -1;
}

export function searchPlaces(places: Place[], rawQuery: string, limit = 8) {
  const query = rawQuery.trim().toLowerCase();
  if (query.length < 2) return [];

  const scored: { place: Place; tier: number }[] = [];

  for (const place of places) {
    const tier = matchTier(place.name.toLowerCase(), query);
    if (tier === -1) continue;
    scored.push({ place, tier });
  }

  scored.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    const rankDelta = kindRank(a.place.kind) - kindRank(b.place.kind);
    if (rankDelta !== 0) return rankDelta;
    if (a.place.name.length !== b.place.name.length) {
      return a.place.name.length - b.place.name.length;
    }
    return a.place.name.localeCompare(b.place.name);
  });

  return scored.slice(0, limit).map((entry) => entry.place);
}
