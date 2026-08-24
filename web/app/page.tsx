"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionLabel } from "@/components/SectionLabel";
import { HeatCanvas } from "@/components/HeatCanvas";
import { MapMarkers, MARKER_KINDS, MARKER_COUNTS } from "@/components/MapMarkers";
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
import { footprintPercent, toLatLon, toPercent } from "@/lib/projection";
import type { HeatLayerId, Place, ReliefKind, TilesFile } from "@/lib/types";

const RAMP_HEX = ["#35617f", "#4e93a0", "#e3b24a", "#dc7a3c", "#c2412e", "#7e1f1a"];

export default function MapPage() {
  const [layerId, setLayerId] = useState<string>("risk");
  const [metric, setMetric] = useState<HeatLayerId>("peak");
  const [selectedZoneId, setSelectedZoneId] = useState(ZONES[0].id);
  const [searchedPlace, setSearchedPlace] = useState<Place | null>(null);
  const [tiles, setTiles] = useState<TilesFile | null>(null);
  const [visibleKinds, setVisibleKinds] = useState<Set<ReliefKind>>(
    () => new Set<ReliefKind>(["cooling"]),
  );

  const activeLayer = HEAT_LAYERS.find((layer) => layer.id === layerId) ?? HEAT_LAYERS[0];
  const showsRisk = activeLayer.dataKey === "risk";
  const dataKey: HeatLayerId = showsRisk ? "risk" : metric;
  const zone = ZONES.find((item) => item.id === selectedZoneId) ?? ZONES[0];
  const relief = nearestRelief(zone.lat, zone.lon, 3);
  const range = tiles?.ranges[dataKey];
  const marker = tiles ? toPercent(tiles, zone.lat, zone.lon) : null;
  const footprint = tiles ? footprintPercent(tiles, ZONE_TILES) : null;
  const searchPoint =
    tiles && searchedPlace ? toPercent(tiles, searchedPlace.lat, searchedPlace.lon) : null;

  const coolest = ZONES[ZONES.length - 1];
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

  function handleMapClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!tiles) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;
    const { lat, lon } = toLatLon(tiles, xPercent, yPercent);
    setSelectedZoneId(nearestZone(lat, lon).id);
    setSearchedPlace(null);
  }

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
                  <span className="mt-0.5 block text-[10.5px] text-ink-4">
                    {layer.dataKey === "risk" ? "Heat plus surroundings" : "14-day history"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {!showsRisk ? (
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
            return (
              <button
                key={kind.id}
                type="button"
                onClick={() => toggleKind(kind.id)}
                aria-pressed={on}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-surface-2/60"
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded border"
                  style={{
                    backgroundColor: on ? kind.color : "transparent",
                    borderColor: on ? kind.color : "var(--line)",
                  }}
                />
                <span className="flex-1 text-[12.5px] text-ink-2">{kind.label}</span>
                <span className="font-mono text-[10.5px] text-ink-4">{MARKER_COUNTS[kind.id] ?? 0}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 px-2.5 text-[10.5px] leading-relaxed text-ink-5">
          From OpenStreetMap.
        </p>
      </div>
    </div>
  );

  return (
    <AppShell
      rail={rail}
      onPlaceSelect={handlePlaceSelect}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <section className="flex min-h-0 flex-col p-3 lg:flex-1">
          <div
            onClick={handleMapClick}
            className="relative min-h-[320px] flex-1 cursor-pointer overflow-hidden rounded-2xl border border-line bg-app"
          >
            <HeatCanvas layer={dataKey} onReady={setTiles} />

            {tiles ? <MapMarkers tiles={tiles} visible={visibleKinds} /> : null}

            {marker && footprint ? (
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-ink shadow-[0_0_0_4px_rgba(12,13,15,0.45)]"
                style={{
                  left: `${marker.xPercent}%`,
                  top: `${marker.yPercent}%`,
                  width: `${footprint.widthPercent}%`,
                  height: `${footprint.heightPercent}%`,
                }}
              />
            ) : null}

            {marker && footprint ? (
              <div
                className="pointer-events-none absolute max-w-[220px] -translate-x-1/2 truncate rounded-full border border-line bg-app/90 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur"
                style={{
                  left: `${marker.xPercent}%`,
                  top: `calc(${marker.yPercent}% - ${footprint.heightPercent / 2}% - 26px)`,
                }}
                title={zoneLabel(zone)}
              >
                {zoneLabel(zone)}
              </div>
            ) : null}

            {searchedPlace && searchPoint ? (
              <>
                <span
                  className="pointer-events-none absolute z-10 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_4px_rgba(79,195,184,0.25)]"
                  style={{ left: `${searchPoint.xPercent}%`, top: `${searchPoint.yPercent}%` }}
                />
                <div
                  className="pointer-events-none absolute z-10 max-w-[220px] -translate-x-1/2 truncate rounded-full border border-accent/40 bg-app/90 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur"
                  style={{
                    left: `${searchPoint.xPercent}%`,
                    top: `calc(${searchPoint.yPercent}% + 12px)`,
                  }}
                  title={searchedPlace.name}
                >
                  {searchedPlace.name}
                </div>
              </>
            ) : null}

            {range ? (
              <div className="absolute bottom-3 left-3 w-[196px] rounded-xl border border-line bg-app/90 p-3 backdrop-blur">
                <SectionLabel>
                  {showsRisk
                    ? "Heat risk score"
                    : metric === "peak"
                      ? "Peak temperature"
                      : metric === "mean"
                        ? "Average temperature"
                        : "Overnight low"}
                </SectionLabel>
                <div className="mt-2 flex gap-0.5">
                  {RAMP_HEX.map((color) => (
                    <span key={color} className="h-2 flex-1 rounded-sm" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between font-mono text-[10px] text-ink-3">
                  <span>{range[0].toFixed(1)}{showsRisk ? "" : "°C"}</span>
                  <span>{range[1].toFixed(1)}{showsRisk ? "" : "°C"}</span>
                </div>
              </div>
            ) : null}

            <div className="absolute right-3 bottom-3 flex items-center gap-2 rounded-full border border-line bg-app/90 px-3 py-1.5 backdrop-blur">
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

          <div className="flex items-baseline gap-2.5">
            <span className="font-mono text-[38px] font-medium leading-none tracking-tight tabular-nums text-ink">
              {zone.peakMax.toFixed(1)}°C
            </span>
            <span className="text-[11.5px] leading-tight text-ink-3">
              peak recorded
              <br />
              avg {zone.meanTemp.toFixed(1)}°C
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-line bg-surface p-3">
              <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-ink-4">Risk score</div>
              <div className="mt-1.5 font-mono text-[18px] font-medium tabular-nums text-ink">
                {zone.riskScore?.toFixed(1) ?? "—"}
                <span className="text-[11px] text-ink-4"> {zone.riskCategory}</span>
              </div>
            </div>
            <div className="rounded-xl border border-line bg-surface p-3">
              <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-ink-4">vs coolest</div>
              <div className="mt-1.5 font-mono text-[18px] font-medium tabular-nums text-heat-3">
                +{(zone.peakMean - coolest.peakMean).toFixed(1)}°C
              </div>
            </div>
          </div>

          {zone.topDrivers.length > 0 ? (
            <div className="rounded-xl border border-line bg-surface p-3">
              <div className="flex items-baseline justify-between">
                <SectionLabel>What drives the risk</SectionLabel>
                <span className="text-[10px] text-ink-5">confidence {zone.dataConfidence}</span>
              </div>
              <div className="mt-2 space-y-2.5">
                {zone.topDrivers.map((entry) => (
                  <div key={entry.driver}>
                    <div className="text-[12px] font-medium text-ink-2">{entry.driver}</div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-ink-4 text-pretty">
                      {entry.recommendation}
                    </p>
                  </div>
                ))}
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
