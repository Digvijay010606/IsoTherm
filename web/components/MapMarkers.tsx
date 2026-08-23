"use client";

import { RELIEF_POINTS, reliefLabel } from "@/lib/realData";
import { toPercent } from "@/lib/projection";
import type { ReliefKind, TilesFile } from "@/lib/types";

export const MARKER_KINDS: { id: ReliefKind; label: string; color: string }[] = [
  { id: "water", label: "Water points", color: "var(--heat-1)" },
  { id: "cooling", label: "Cooling locations", color: "var(--accent)" },
  { id: "shade", label: "Shade shelters", color: "var(--heat-2)" },
  { id: "medical", label: "Medical", color: "var(--danger-ink)" },
];

export const MARKER_COUNTS: Record<string, number> = RELIEF_POINTS.reduce(
  (counts, point) => {
    counts[point.kind] = (counts[point.kind] ?? 0) + 1;
    return counts;
  },
  {} as Record<string, number>,
);

type MapMarkersProps = {
  tiles: TilesFile;
  visible: Set<ReliefKind>;
};

export function MapMarkers({ tiles, visible }: MapMarkersProps) {
  const colorFor = (kind: ReliefKind) =>
    MARKER_KINDS.find((entry) => entry.id === kind)?.color ?? "var(--ink-3)";

  return (
    <>
      {RELIEF_POINTS.map((point, index) => {
        if (!visible.has(point.kind)) return null;
        const { xPercent, yPercent } = toPercent(tiles, point.lat, point.lon);
        if (xPercent < 0 || xPercent > 100 || yPercent < 0 || yPercent > 100) return null;
        return (
          <span
            key={index}
            title={reliefLabel(point)}
            className="pointer-events-none absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-black/40"
            style={{
              left: `${xPercent}%`,
              top: `${yPercent}%`,
              backgroundColor: colorFor(point.kind),
            }}
          />
        );
      })}
    </>
  );
}
