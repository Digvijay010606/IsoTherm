import metaFile from "../public/data/meta.json";
import type { Zone } from "./types";

export const RISK_WEIGHTS: Record<string, number> = metaFile.riskWeights;

export const IMPROVABLE_DRIVERS = [
  "Green-cover deficit",
  "Shade deficit",
  "Cooling-water deficit",
];

export const INTERVENTION_LABELS: Record<string, string> = {
  "Green-cover deficit": "Plant trees and green corridors",
  "Shade deficit": "Add shaded shelters and waiting zones",
  "Cooling-water deficit": "Add hydration and cooling points",
};

export type ProjectionLever = {
  driver: string;
  label: string;
  reduction: number;
};

export function improvableDrivers(zone: Zone) {
  return IMPROVABLE_DRIVERS.filter((driver) => zone.riskFeatures?.[driver] !== undefined);
}

export function isFlaggedDriver(zone: Zone, driver: string) {
  return zone.topDrivers.some((entry) => entry.driver === driver);
}

export function leverReduction(zone: Zone, driver: string, improvementPercent: number) {
  const weight = RISK_WEIGHTS[driver];
  const feature = zone.riskFeatures?.[driver];
  if (!weight || feature === undefined) return 0;
  return 100 * weight * feature * (improvementPercent / 100);
}

export function projectRisk(zone: Zone, drivers: string[], improvementPercent: number) {
  const current = zone.riskScore;
  if (current === null) return null;

  const levers: ProjectionLever[] = drivers
    .map((driver) => ({
      driver,
      label: INTERVENTION_LABELS[driver] ?? driver,
      reduction: leverReduction(zone, driver, improvementPercent),
    }))
    .filter((lever) => lever.reduction > 0)
    .sort((a, b) => b.reduction - a.reduction);

  const reduction = levers.reduce((total, lever) => total + lever.reduction, 0);
  const projected = Math.max(0, current - reduction);

  return { current, projected, reduction, levers };
}
