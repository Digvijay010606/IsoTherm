import type { HeatLayerId, TilesFile } from "./types";

export const RAMP = ["#1b6fae", "#1fb6c9", "#7fd44a", "#ffd23f", "#f97316", "#e0142c"];

const RAMP_RGB = RAMP.map((hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]);

function rampAt(position: number) {
  const scaled = Math.min(Math.max(position, 0), 1) * (RAMP_RGB.length - 1);
  const lower = Math.min(Math.floor(scaled), RAMP_RGB.length - 2);
  const mix = scaled - lower;
  const from = RAMP_RGB[lower];
  const to = RAMP_RGB[lower + 1];
  return [
    Math.round(from[0] + (to[0] - from[0]) * mix),
    Math.round(from[1] + (to[1] - from[1]) * mix),
    Math.round(from[2] + (to[2] - from[2]) * mix),
  ];
}

export function renderTileImage(tiles: TilesFile, layer: HeatLayerId): string {
  const { cols, rows, layers, ranges } = tiles;

  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const image = ctx.createImageData(cols, rows);
  const grid = layers[layer];
  const [lo, hi] = ranges[layer];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const value = grid[row][col];
      if (value === null) continue;

      const offset = ((rows - 1 - row) * cols + col) * 4;
      const [red, green, blue] = rampAt(hi > lo ? (value - lo) / (hi - lo) : 0);

      image.data[offset] = red;
      image.data[offset + 1] = green;
      image.data[offset + 2] = blue;
      image.data[offset + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}
