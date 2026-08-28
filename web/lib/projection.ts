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

export type LatLonBounds = [[number, number], [number, number]];

export function tileSteps(tiles: TilesFile) {
  const [minLon, minLat, maxLon, maxLat] = tiles.bounds;
  return {
    lonStep: (maxLon - minLon) / (tiles.cols - 1),
    latStep: (maxLat - minLat) / (tiles.rows - 1),
  };
}

export function tileExtent(tiles: TilesFile): LatLonBounds {
  const [minLon, minLat, maxLon, maxLat] = tiles.bounds;
  const { lonStep, latStep } = tileSteps(tiles);
  return [
    [minLat - latStep / 2, minLon - lonStep / 2],
    [maxLat + latStep / 2, maxLon + lonStep / 2],
  ];
}

export function zoneBounds(
  tiles: TilesFile,
  zoneTiles: number,
  lat: number,
  lon: number,
): LatLonBounds {
  const { lonStep, latStep } = tileSteps(tiles);
  const [[southEdge, westEdge], [northEdge, eastEdge]] = tileExtent(tiles);
  const halfLat = (zoneTiles * latStep) / 2;
  const halfLon = (zoneTiles * lonStep) / 2;
  return [
    [Math.max(lat - halfLat, southEdge), Math.max(lon - halfLon, westEdge)],
    [Math.min(lat + halfLat, northEdge), Math.min(lon + halfLon, eastEdge)],
  ];
}
