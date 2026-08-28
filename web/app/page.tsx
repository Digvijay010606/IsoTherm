"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/AppShell";
import { SectionLabel } from "@/components/SectionLabel";
import { DriverBreakdown } from "@/components/DriverBreakdown";
import { MARKER_KINDS, MARKER_COUNTS } from "@/components/MapMarkers";
import { HEAT_LAYERS, TEMPERATURE_METRICS } from "@/lib/heatLayers";
import {
  ZONES,
  ZONE_TILES,
  TILE_COUNT,
  nearestRelief,
  nearestZone,
  reliefLabel,
  zoneCode,
  zoneLabel,
} from "@/lib/realData";
import { subscribeToReports } from "@/lib/reports";
import { supabaseReady } from "@/lib/supabase";
import { RAMP } from "@/lib/tileImage";
import { ReportIcon } from "@/components/icons";
import type { HeatLayerId, Place, ReliefKind, Report, TilesFile } from "@/lib/types";

const HeatMap = dynamic(() => import("@/components/HeatMap").then((module) => module.HeatMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-[13px] text-ink-4">
      Loading map…
    </div>
  ),
});

export default function MapPage() {
  const [layerId, setLayerId] = useState<string>("risk");
  const [metric, setMetric] = useState<HeatLayerId>("peak");
  const [selectedZoneId, setSelectedZoneId] = useState(ZONES[0].id);
  const [searchedPlace, setSearchedPlace] = useState<Place | null>(null);
  const [tiles, setTiles] = useState<TilesFile | null>(null);
  const [visibleKinds, setVisibleKinds] = useState<Set<ReliefKind>>(() => new Set<ReliefKind>());
  const [reports, setReports] = useState<Report[]>([]);
  const [showReports, setShowReports] = useState(true);

  useEffect(() => subscribeToReports(setReports), []);

  const activeLayer = HEAT_LAYERS.find((layer) => layer.id === layerId) ?? HEAT_LAYERS[0];
  const showsTemperature = activeLayer.id === "peak";
  const dataKey: HeatLayerId = showsTemperature ? metric : activeLayer.dataKey;
  const legendTitle = showsTemperature
    ? (TEMPERATURE_METRICS.find((option) => option.id === metric)?.label ?? activeLayer.label)
    : activeLayer.label;
  const zone = ZONES.find((item) => item.id === selectedZoneId) ?? ZONES[0];
  const relief = nearestRelief(zone.lat, zone.lon, 3);
  const range = tiles?.ranges[dataKey];

  const coolest = ZONES[ZONES.length - 1];
  const riskTone =
    zone.riskCategory === "Critical"
      ? "text-danger-ink"
      : zone.riskCategory === "High"
        ? "text-heat-3"
        : zone.riskCategory === "Moderate"
          ? "text-heat-2"
          : "text-heat-1";
  const band = Math.ceil((zone.rank / ZONES.length) * 4);
  const bandLabel = ["TOP 25% HOTTEST", "UPPER MIDDLE", "LOWER MIDDLE", "COOLEST 25%"][band - 1];
  const bandTone = ["bg-heat-4/15 border-heat-4/45 text-danger-ink", "bg-heat-3/15 border-heat-3/45 text-heat-3", "bg-heat-2/15 border-heat-2/45 text-heat-2", "bg-heat-1/15 border-heat-1/45 text-heat-1"][band - 1];

  function toggleKind(kind: ReliefKind) {
    setVisibleKinds((current) => {
      const next = new Set(current);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }

  const handleMapSelect = useCallback((lat: number, lon: number) => {
    setSelectedZoneId(nearestZone(lat, lon).id);
    setSearchedPlace(null);
  }, []);

  function handlePlaceSelect(place: Place) {
    setSelectedZoneId(nearestZone(place.lat, place.lon).id);
    setSearchedPlace(place);
  }

  const rail = (
    <div className="space-y-5">
      <div>
        <SectionLabel>Heat layer</SectionLabel>
        <div className="mt-2 space-y-0.5">
          {HEAT_LAYERS.map((layer) => {
            const active = layerId === layer.id;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setLayerId(layer.id)}
                className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  active ? "bg-surface-2" : "hover:bg-surface-2/60"
                }`}
              >
                <span
                  className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 ${
                    active ? "border-[5px] border-accent" : "border-line"
                  }`}
                />
                <span className="min-w-0">
                  <span className={`block text-[12.5px] ${active ? "font-medium text-ink" : "text-ink-2"}`}>
                    {layer.label}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] text-ink-4">{layer.caption}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {showsTemperature ? (
        <div>
          <SectionLabel>Metric</SectionLabel>
          <div className="mt-2 space-y-0.5">
            {TEMPERATURE_METRICS.map((option) => {
              const active = metric === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMetric(option.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] transition-colors ${
                    active ? "bg-surface-2 font-medium text-ink" : "text-ink-2 hover:bg-surface-2/60"
                  }`}
                >
                  <span
                    className={`h-3 w-3 shrink-0 rounded-full border-2 ${
                      active ? "border-[5px] border-accent" : "border-line"
                    }`}
                  />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div>
        <SectionLabel>Map markers</SectionLabel>
        <div className="mt-2 space-y-0.5">
          {MARKER_KINDS.map((kind) => {
            const on = visibleKinds.has(kind.id);
            const Icon = kind.icon;
            return (
              <button
                key={kind.id}
                type="button"
                onClick={() => toggleKind(kind.id)}
                aria-pressed={on}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-surface-2/60"
              >
                <span
                  className="flex size-[18px] shrink-0 items-center justify-center rounded-md border"
                  style={{
                    borderColor: on ? kind.color : "var(--line)",
                    color: on ? kind.color : "var(--ink-5)",
                  }}
                >
                  <Icon size={11} />
                </span>
                <span className={`flex-1 text-[12.5px] ${on ? "text-ink" : "text-ink-3"}`}>
                  {kind.label}
                </span>
                <span className="font-mono text-[10.5px] text-ink-4">{MARKER_COUNTS[kind.id] ?? 0}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 px-2.5 text-[10.5px] leading-relaxed text-ink-5">
          From OpenStreetMap.
        </p>
      </div>

      {supabaseReady ? (
        <div>
          <SectionLabel>Community</SectionLabel>
          <div className="mt-2 space-y-0.5">
            <button
              type="button"
              onClick={() => setShowReports((current) => !current)}
              aria-pressed={showReports}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-surface-2/60"
            >
              <span
                className="flex size-[18px] shrink-0 items-center justify-center rounded-md border"
                style={{
                  borderColor: showReports ? "var(--marker-report)" : "var(--line)",
                  color: showReports ? "var(--marker-report)" : "var(--ink-5)",
                }}
              >
                <ReportIcon size={11} />
              </span>
              <span className={`flex-1 text-[12.5px] ${showReports ? "text-ink" : "text-ink-3"}`}>
                Reported conditions
              </span>
              <span className="font-mono text-[10.5px] text-ink-4">{reports.length}</span>
            </button>
          </div>
          <p className="mt-2 px-2.5 text-[10.5px] leading-relaxed text-ink-5">
            Anonymous, rounded to a 1.5 km zone.
          </p>
        </div>
      ) : null}
    </div>
  );

  return (
    <AppShell
      rail={rail}
      onPlaceSelect={handlePlaceSelect}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <section className="flex min-h-0 flex-col p-3 lg:flex-1">
          <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-2xl border border-line bg-app">
            <HeatMap
              layer={dataKey}
              zone={zone}
              zoneTiles={ZONE_TILES}
              visibleKinds={visibleKinds}
              searchedPlace={searchedPlace}
              reports={reports}
              showReports={showReports}
              onSelect={handleMapSelect}
              onReady={setTiles}
            />

            {range ? (
              <div className="pointer-events-none absolute bottom-9 left-3 z-[1100] w-[196px] rounded-xl border border-line bg-app/90 p-3 backdrop-blur">
                <SectionLabel>{legendTitle}</SectionLabel>
                <div className="mt-2 flex gap-0.5">
                  {RAMP.map((color) => (
                    <span key={color} className="h-2 flex-1 rounded-sm" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between font-mono text-[10px] text-ink-3">
                  <span>{range[0].toFixed(1)}{activeLayer.unit}</span>
                  <span>{range[1].toFixed(1)}{activeLayer.unit}</span>
                </div>
              </div>
            ) : null}

            <div className="pointer-events-none absolute top-3 right-3 z-[1100] flex items-center gap-2 rounded-full border border-line bg-app/90 px-3 py-1.5 backdrop-blur">
              <span className="text-[10.5px] text-ink-4">FortyGuard Temperature API</span>
              <span className="h-1 w-1 rounded-full bg-accent" />
              <span className="font-mono text-[10.5px] text-ink-3">100 m</span>
            </div>
          </div>
        </section>

        <aside className="shrink-0 space-y-3 overflow-y-auto border-t border-line-soft p-3 lg:w-[330px] lg:border-t-0 lg:border-l">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-[16px] font-semibold text-ink">{zoneLabel(zone)}</div>
              <div className="mt-0.5 font-mono text-[10.5px] text-ink-4">
                {zoneCode(zone)} · {zone.lat.toFixed(4)}, {zone.lon.toFixed(4)}
              </div>
            </div>
            <span className={`shrink-0 rounded-lg border px-2 py-1 text-[9px] font-semibold tracking-[0.08em] ${bandTone}`}>
              {bandLabel}
            </span>
          </div>

          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-baseline justify-between gap-2">
              <SectionLabel>Risk score</SectionLabel>
              <span className="text-[10px] text-ink-5">confidence {zone.dataConfidence}</span>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2.5">
              <span className={`font-mono text-[36px] font-medium leading-none tracking-tight tabular-nums ${riskTone}`}>
                {zone.riskScore?.toFixed(1) ?? "—"}
              </span>
              <div>
                <div className={`text-[13px] font-semibold ${riskTone}`}>{zone.riskCategory}</div>
                <div className="text-[10.5px] text-ink-4">out of 100</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-3.5">
              <div>
                <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-ink-4">Peak</div>
                <div className="mt-1.5 font-mono text-[19px] font-medium tabular-nums text-ink">
                  {zone.peakMax.toFixed(1)}°
                </div>
              </div>
              <div>
                <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-ink-4">Average</div>
                <div className="mt-1.5 font-mono text-[19px] font-medium tabular-nums text-ink-2">
                  {zone.meanTemp.toFixed(1)}°
                </div>
              </div>
              <div>
                <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-ink-4">vs coolest</div>
                <div className="mt-1.5 font-mono text-[19px] font-medium tabular-nums text-heat-3">
                  +{(zone.peakMean - coolest.peakMean).toFixed(1)}°
                </div>
              </div>
            </div>
          </div>

          {zone.topDrivers.length > 0 ? (
            <div className="rounded-xl border border-line bg-surface p-3">
              <SectionLabel>What drives the risk</SectionLabel>
              <div className="mt-1">
                <DriverBreakdown key={zone.id} drivers={zone.topDrivers} />
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-line bg-surface p-3">
            <SectionLabel>Nearest relief</SectionLabel>
            <div className="mt-2 space-y-1.5">
              {relief.map(({ point, distanceLabel: dist }, index) => (
                <div key={index} className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="truncate text-ink-2">{reliefLabel(point)}</span>
                  <span className="shrink-0 font-mono text-ink-4">{dist}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="px-1 text-[10.5px] leading-relaxed text-ink-5">
            {TILE_COUNT.toLocaleString()} tiles at 100 m. Click the map to select a zone.
          </p>
        </aside>
      </div>
    </AppShell>
  );
}
