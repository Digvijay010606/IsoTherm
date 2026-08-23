"use client";

import { useEffect, useRef } from "react";
import { useJson } from "@/lib/useJson";
import type { HeatLayerId, TilesFile } from "@/lib/types";

const RAMP = ["#35617f", "#4e93a0", "#e3b24a", "#dc7a3c", "#c2412e", "#7e1f1a"];

function buildNoDataPattern(ctx: CanvasRenderingContext2D) {
  const tile = document.createElement("canvas");
  tile.width = 8;
  tile.height = 8;
  const tileCtx = tile.getContext("2d");
  if (!tileCtx) return null;
  tileCtx.strokeStyle = "#23262a";
  tileCtx.lineWidth = 1;
  tileCtx.beginPath();
  tileCtx.moveTo(0, 8);
  tileCtx.lineTo(8, 0);
  tileCtx.stroke();
  return ctx.createPattern(tile, "repeat");
}

type HeatCanvasProps = {
  layer: HeatLayerId;
  onReady?: (tiles: TilesFile) => void;
};

export function HeatCanvas({ layer, onReady }: HeatCanvasProps) {
  const state = useJson<TilesFile>("/data/tiles.json");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (state.status === "ready" && onReady) onReady(state.data);
  }, [state, onReady]);

  useEffect(() => {
    if (state.status !== "ready") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const noDataPattern = buildNoDataPattern(ctx);

      const { cols, rows, layers, ranges } = state.data;
      const grid = layers[layer];
      const [lo, hi] = ranges[layer];
      const cellWidth = width / cols;
      const cellHeight = height / rows;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const value = grid[row][col];
          const y = height - (row + 1) * cellHeight;

          if (value === null) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = noDataPattern ?? "#14171a";
            ctx.fillRect(col * cellWidth, y, cellWidth + 0.5, cellHeight + 0.5);
            continue;
          }

          const t = hi > lo ? (value - lo) / (hi - lo) : 0;
          const band = Math.min(5, Math.floor(t * 6));
          ctx.globalAlpha = 0.62 + t * 0.3;
          ctx.fillStyle = RAMP[band];
          ctx.fillRect(col * cellWidth, y, cellWidth + 0.5, cellHeight + 0.5);
        }
      }
      ctx.globalAlpha = 1;
    };

    draw();
    const observer = new ResizeObserver(draw);
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, [state, layer]);

  if (state.status === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center text-[13px] text-ink-4">
        Loading heat data…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex h-full w-full items-center justify-center px-6 text-center text-[13px] text-ink-4">
        Could not load heat tiles. Run scripts/export_web_data.py and refresh.
      </div>
    );
  }

  return <canvas ref={canvasRef} className="block h-full w-full" />;
}
