import type { TilesFile } from "./types";

export function toPercent(tiles: TilesFile, lat: number, lon: number) {
  const [minLon, minLat, maxLon, maxLat] = tiles.bounds;
  const xPercent = ((lon - minLon) / (maxLon - minLon)) * 100;
  const yPercent = ((maxLat - lat) / (maxLat - minLat)) * 100;
  return { xPercent, yPercent };
}

export function toLatLon(tiles: TilesFile, xPercent: number, yPercent: number) {
  const [minLon, minLat, maxLon, maxLat] = tiles.bounds;
  const lon = minLon + (xPercent / 100) * (maxLon - minLon);
  const lat = maxLat - (yPercent / 100) * (maxLat - minLat);
  return { lat, lon };
}

export function footprintPercent(tiles: TilesFile, zoneTiles: number) {
  return {
    widthPercent: (zoneTiles / tiles.cols) * 100,
    heightPercent: (zoneTiles / tiles.rows) * 100,
  };
}
