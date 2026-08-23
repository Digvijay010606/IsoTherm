export type HeatLayerId = "peak" | "mean" | "low";

export type TilesFile = {
  bounds: [number, number, number, number];
  cols: number;
  rows: number;
  tileMeters: number;
  ranges: Record<HeatLayerId, [number, number]>;
  layers: Record<HeatLayerId, (number | null)[][]>;
};

export type Zone = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  peakMax: number;
  peakMean: number;
  meanTemp: number;
  rank: number;
  tiles: number;
};

export type ReliefKind = "water" | "shade" | "cooling" | "medical" | "facility";

export type ReliefPoint = {
  amenity: string;
  kind: ReliefKind;
  lat: number;
  lon: number;
  name: string | null;
};

export type Park = {
  name: string;
  lat: number;
  lon: number;
};

export type Place = {
  name: string;
  kind: string;
  lat: number;
  lon: number;
};

export type PlacesFile = {
  places: Place[];
};

export type AreaMeta = {
  name: string;
  south: number;
  west: number;
  north: number;
  east: number;
};

export type ReportCategoryId =
  | "no-shade"
  | "no-water"
  | "unsafe-site"
  | "hot-indoors"
  | "cooling-shut"
  | "no-cover";

export type ReportCategory = {
  id: ReportCategoryId;
  label: string;
};

export type ForecastPoint = {
  hourLabel: string;
  heatIndexC: number;
};

export type WarningSign = {
  title: string;
  body: string;
};

export type Intervention = {
  id: string;
  kind: string;
  costLabel: string;
  title: string;
  body: string;
  exposureHoursRemoved: number;
};
