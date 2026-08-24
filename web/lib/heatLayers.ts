import type { HeatLayerId } from "./types";

export type HeatLayerDef = {
  id: HeatLayerId | "exceedance" | "persistence" | "peakHour";
  label: string;
  status: "ready" | "pending";
  pendingReason?: string;
  dataKey?: HeatLayerId;
};

export const HEAT_LAYERS: HeatLayerDef[] = [
  {
    id: "risk",
    label: "Heat risk score",
    status: "ready",
    dataKey: "risk",
  },
  {
    id: "peak",
    label: "Temperature",
    status: "ready",
    dataKey: "peak",
  },
  {
    id: "exceedance",
    label: "Hours above threshold",
    status: "pending",
    pendingReason: "Needs one more FortyGuard call with analytic_type set to exceedance.",
  },
  {
    id: "persistence",
    label: "Longest heat run",
    status: "pending",
    pendingReason: "Needs one more FortyGuard call with analytic_type set to persistence.",
  },
  {
    id: "peakHour",
    label: "Hour of peak heat",
    status: "pending",
    pendingReason: "Needs one more FortyGuard call with analytic_type set to time_of_measure.",
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
