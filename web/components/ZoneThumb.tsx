"use client";

import { useState } from "react";
import { HeatCanvas } from "./HeatCanvas";
import { footprintPercent, toPercent } from "@/lib/projection";
import { ZONE_TILES } from "@/lib/realData";
import type { TilesFile, Zone } from "@/lib/types";

export function ZoneThumb({ zone }: { zone: Zone }) {
  const [tiles, setTiles] = useState<TilesFile | null>(null);
  const marker = tiles ? toPercent(tiles, zone.lat, zone.lon) : null;
  const footprint = tiles ? footprintPercent(tiles, ZONE_TILES) : null;

  return (
    <div className="relative aspect-[107/96] w-full overflow-hidden rounded-lg bg-app">
      <HeatCanvas layer="peak" onReady={setTiles} />
      {marker && footprint ? (
        <span
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-ink shadow-[0_0_0_3px_rgba(12,13,15,0.5)]"
          style={{
            left: `${marker.xPercent}%`,
            top: `${marker.yPercent}%`,
            width: `${footprint.widthPercent}%`,
            height: `${footprint.heightPercent}%`,
          }}
        />
      ) : null}
    </div>
  );
}
