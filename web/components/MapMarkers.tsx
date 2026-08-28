import { RELIEF_POINTS } from "@/lib/realData";
import { DropIcon, SnowIcon, UmbrellaIcon, MedicalIcon } from "./icons";
import type { ReliefKind } from "@/lib/types";

type MarkerKind = {
  id: ReliefKind;
  label: string;
  color: string;
  icon: (props: { size?: number; className?: string }) => React.ReactElement;
};

export const MARKER_KINDS: MarkerKind[] = [
  { id: "water", label: "Water points", color: "#3f8fd0", icon: DropIcon },
  { id: "cooling", label: "Cooling locations", color: "#b7e4ee", icon: SnowIcon },
  { id: "shade", label: "Shade shelters", color: "#f0b93f", icon: UmbrellaIcon },
  { id: "medical", label: "Medical", color: "#ef6f63", icon: MedicalIcon },
];

const GLYPH_OPEN = '<svg viewBox="0 0 24 24" width="10" height="10"';

export const MARKER_GLYPHS: Record<string, string> = {
  water: `${GLYPH_OPEN} fill="currentColor"><path d="M12 2.6c0 0 6.6 6.9 6.6 11.1a6.6 6.6 0 1 1-13.2 0C5.4 9.5 12 2.6 12 2.6z"/></svg>`,
  cooling: `${GLYPH_OPEN} fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.4v19.2"/><path d="M3.7 7.2 20.3 16.8"/><path d="M20.3 7.2 3.7 16.8"/><path d="M9.2 4.4 12 7.2l2.8-2.8"/><path d="M9.2 19.6 12 16.8l2.8 2.8"/></svg>`,
  shade: `${GLYPH_OPEN} fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.6 12a9.4 9.4 0 0 1 18.8 0z" fill="currentColor" stroke="none"/><path d="M12 12v7.4"/></svg>`,
  medical: `${GLYPH_OPEN} fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
  report: `${GLYPH_OPEN} fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 L21 20 H3 Z"/><path d="M12 10v4"/><path d="M12 17v.01"/></svg>`,
};

export const MARKER_COLORS: Record<string, string> = MARKER_KINDS.reduce(
  (colors, kind) => {
    colors[kind.id] = kind.color;
    return colors;
  },
  {} as Record<string, string>,
);

export const MARKER_COUNTS: Record<string, number> = RELIEF_POINTS.reduce(
  (counts, point) => {
    counts[point.kind] = (counts[point.kind] ?? 0) + 1;
    return counts;
  },
  {} as Record<string, number>,
);
