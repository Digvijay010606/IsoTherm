import type { HeatLayerId } from "./types";

export type HeatLayerDef = {
  id: HeatLayerId;
  label: string;
  dataKey: HeatLayerId;
};

export const HEAT_LAYERS: HeatLayerDef[] = [
  {
    id: "risk",
    label: "Heat risk score",
    dataKey: "risk",
  },
  {
    id: "peak",
    label: "Temperature",
    dataKey: "peak",
  },
];

export const TEMPERATURE_METRICS: { id: HeatLayerId; label: string }[] = [
  { id: "peak", label: "14-day peak" },
  { id: "mean", label: "14-day average" },
  { id: "low", label: "Overnight low" },
];

export const RANKING_METRICS: { id: HeatLayerId; label: string }[] = [
  { id: "risk", label: "Risk score" },
  { id: "peak", label: "14-day peak" },
  { id: "mean", label: "14-day average" },
];
