import type { HeatLayerId, ZoneMetricId } from "./types";

export type HeatLayerDef = {
  id: HeatLayerId;
  label: string;
  dataKey: HeatLayerId;
  caption: string;
  unit: string;
};

export const HEAT_LAYERS: HeatLayerDef[] = [
  {
    id: "risk",
    label: "Heat risk score",
    dataKey: "risk",
    caption: "Heat plus surroundings",
    unit: "",
  },
  {
    id: "peak",
    label: "Temperature",
    dataKey: "peak",
    caption: "14-day history",
    unit: "°C",
  },
  {
    id: "exceedance",
    label: "Hours above 35°C",
    dataKey: "exceedance",
    caption: "How long a site stays dangerous",
    unit: " h",
  },
  {
    id: "persistence",
    label: "Longest unbroken spell",
    dataKey: "persistence",
    caption: "Stretch with no recovery",
    unit: " h",
  },
];

export const TEMPERATURE_METRICS: { id: HeatLayerId; label: string }[] = [
  { id: "peak", label: "14-day peak" },
  { id: "mean", label: "14-day average" },
  { id: "low", label: "Overnight low" },
];

export const RANKING_METRICS: { id: ZoneMetricId; label: string }[] = [
  { id: "risk", label: "Risk score" },
  { id: "peak", label: "14-day peak" },
  { id: "mean", label: "14-day average" },
];
