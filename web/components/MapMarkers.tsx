"use client";

import { RELIEF_POINTS, reliefLabel } from "@/lib/realData";
import { toPercent } from "@/lib/projection";
import { DropIcon, SnowIcon, UmbrellaIcon, MedicalIcon } from "./icons";
import type { ReliefKind, TilesFile } from "@/lib/types";

type MarkerKind = {
  id: ReliefKind;
  label: string;
  color: string;
  icon: (props: { size?: number; className?: string }) => React.ReactElement;
};

export const MARKER_KINDS: MarkerKind[] = [
  { id: "water", label: "Water points", color: "var(--marker-water)", icon: DropIcon },
  { id: "cooling", label: "Cooling locations", color: "var(--marker-cooling)", icon: SnowIcon },
  { id: "shade", label: "Shade shelters", color: "var(--marker-shade)", icon: UmbrellaIcon },
  { id: "medical", label: "Medical", color: "var(--marker-medical)", icon: MedicalIcon },
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
  return (
    <>
      {RELIEF_POINTS.map((point, index) => {
        if (!visible.has(point.kind)) return null;
        const kind = MARKER_KINDS.find((entry) => entry.id === point.kind);
        if (!kind) return null;
        const { xPercent, yPercent } = toPercent(tiles, point.lat, point.lon);
        if (xPercent < 0 || xPercent > 100 || yPercent < 0 || yPercent > 100) return null;
        const Icon = kind.icon;
        return (
          <span
            key={index}
            title={reliefLabel(point)}
            className="pointer-events-none absolute flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.55)] ring-1 ring-black/45"
            style={{
              left: `${xPercent}%`,
              top: `${yPercent}%`,
              backgroundColor: kind.color,
              color: "var(--app)",
            }}
          >
            <Icon size={10} />
          </span>
        );
      })}
    </>
  );
}
