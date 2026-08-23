import zonesFile from "../public/data/zones.json";
import amenitiesFile from "../public/data/amenities.json";
import metaFile from "../public/data/meta.json";
import type { AreaMeta, Park, ReliefKind, ReliefPoint, Zone } from "./types";

export const ZONES: Zone[] = zonesFile.zones as Zone[];

export const ZONE_TILES = zonesFile.zoneTiles;

export const RELIEF_POINTS: ReliefPoint[] = amenitiesFile.relief as ReliefPoint[];

export const PARKS: Park[] = amenitiesFile.parks as Park[];

export const AREA: AreaMeta = metaFile.area;

export const PERIOD_START = metaFile.period.start;
export const PERIOD_END = metaFile.period.end;
export const TILE_COUNT = metaFile.tileCount;

export function zoneLabel(zone: Zone) {
  return zone.name;
}

export function zoneCode(zone: Zone) {
  return `Zone ${zone.id}`;
}

const RELIEF_KIND_LABELS: Record<ReliefKind, string> = {
  water: "Water point",
  shade: "Shade shelter",
  cooling: "Cooling location",
  medical: "Medical facility",
  facility: "Facility",
};

export function reliefLabel(point: ReliefPoint) {
  return point.name ?? RELIEF_KIND_LABELS[point.kind];
}

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function distanceLabel(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function nearestRelief(lat: number, lon: number, count: number) {
  return RELIEF_POINTS
    .map((point) => ({ point, km: haversineKm(lat, lon, point.lat, point.lon) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, count)
    .map(({ point, km }) => ({ point, distanceLabel: distanceLabel(km) }));
}

const COOLING_GAP_KM = 0.8;

const COOLING_POINTS = RELIEF_POINTS.filter((point) => point.kind === "cooling");

export function nearestCoolingKm(lat: number, lon: number) {
  let closest = Infinity;
  for (const point of COOLING_POINTS) {
    const km = haversineKm(lat, lon, point.lat, point.lon);
    if (km < closest) closest = km;
  }
  return closest;
}

export function coolingGapZones() {
  return ZONES
    .map((zone) => ({ zone, km: nearestCoolingKm(zone.lat, zone.lon) }))
    .filter((entry) => entry.km > COOLING_GAP_KM)
    .sort((a, b) => b.km - a.km);
}

export function nearestZone(lat: number, lon: number) {
  let closest = ZONES[0];
  let closestKm = Infinity;
  for (const zone of ZONES) {
    const km = haversineKm(lat, lon, zone.lat, zone.lon);
    if (km < closestKm) {
      closestKm = km;
      closest = zone;
    }
  }
  return closest;
}
