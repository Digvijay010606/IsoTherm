"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionLabel } from "@/components/SectionLabel";
import { ZONES, coolingGapZones, nearestZone, zoneLabel } from "@/lib/realData";
import { RANKING_METRICS } from "@/lib/heatLayers";
import type { HeatLayerId } from "@/lib/types";

const METRIC_FIELD: Record<HeatLayerId, (zone: (typeof ZONES)[number]) => number> = {
  peak: (zone) => zone.peakMean,
  mean: (zone) => zone.meanTemp,
  low: (zone) => zone.meanTemp,
  risk: (zone) => zone.riskScore ?? 0,
};

export default function ImpactPage() {
  const [metric, setMetric] = useState<HeatLayerId>("risk");
  const [highlightedZoneId, setHighlightedZoneId] = useState<string | null>(null);

  function focusZone(lat: number, lon: number) {
    const zone = nearestZone(lat, lon);
    setHighlightedZoneId(zone.id);
    requestAnimationFrame(() => {
      document
        .getElementById(`zone-row-${zone.id}`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }

  const ranked = [...ZONES].sort((a, b) => METRIC_FIELD[metric](b) - METRIC_FIELD[metric](a));
  const rangeTop = METRIC_FIELD[metric](ranked[0]);
  const rangeBottom = METRIC_FIELD[metric](ranked[ranked.length - 1]);
  const spread = rangeTop - rangeBottom;

  const byTemperature = [...ZONES].sort((a, b) => b.peakMean - a.peakMean);
  const hottest = byTemperature[0];
  const coolest = byTemperature[byTemperature.length - 1];
  const temperatureSpread = hottest.peakMean - coolest.peakMean;

  const gapZones = coolingGapZones();
  const criticalCount = ZONES.filter((zone) => zone.riskCategory === "Critical").length;
  const highestRisk = [...ZONES].sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0))[0];

  const rail = (
    <div className="space-y-5">
      <div>
        <SectionLabel>Rank by</SectionLabel>
        <div className="mt-2 space-y-0.5">
          {RANKING_METRICS.map((option) => {
            const active = metric === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setMetric(option.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors ${
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

      <div className="rounded-xl border border-dashed border-line p-3">
        <p className="text-[11px] leading-relaxed text-ink-4">
          Public transparency view. Anyone can read it — no login, no account.
        </p>
      </div>
    </div>
  );

  return (
    <AppShell
      rail={rail}
      searchPlaceholder="Find a place in the ranking"
      onPlaceSelect={(place) => focusZone(place.lat, place.lon)}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 lg:px-6">
          <h1 className="text-[21px] font-semibold tracking-tight text-ink text-balance">
            Where heat is costing the most
          </h1>
          <p className="mt-1 text-[12.5px] text-ink-3">
            {ZONES.length} zones ranked from 9,941 tiles measured at 100 m
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-line bg-surface p-4">
              <SectionLabel>Hottest zone</SectionLabel>
              <div className="mt-2 font-mono text-[24px] font-medium tabular-nums text-heat-4">
                {hottest.peakMax.toFixed(1)}°C
              </div>
              <div className="mt-1 text-[11.5px] text-ink-3">{zoneLabel(hottest)}</div>
            </div>

            <div className="rounded-xl border border-line bg-surface p-4">
              <SectionLabel>Spread across city</SectionLabel>
              <div className="mt-2 font-mono text-[24px] font-medium tabular-nums text-heat-3">
                {temperatureSpread.toFixed(1)}°C
              </div>
              <div className="mt-1 text-[11.5px] text-ink-3">Hottest vs coolest zone</div>
            </div>

            <div className="rounded-xl border border-line bg-surface p-4">
              <SectionLabel>Cooling gap</SectionLabel>
              <div className="mt-2 font-mono text-[24px] font-medium tabular-nums text-heat-2">
                {gapZones.length}
              </div>
              <div className="mt-1 text-[11.5px] text-ink-3">Zones over 800 m from cooling</div>
            </div>

            <div className="rounded-xl border border-line bg-surface p-4">
              <SectionLabel>Critical zones</SectionLabel>
              <div className="mt-2 font-mono text-[24px] font-medium tabular-nums text-heat-4">
                {criticalCount}
              </div>
              <div className="mt-1 text-[11.5px] text-ink-3">Risk score above 75</div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-xl border border-line bg-surface">
              <div className="flex items-baseline justify-between border-b border-line px-4 py-3">
                <span className="text-[13.5px] font-semibold text-ink">
                  Zones ranked by{" "}
                  {metric === "risk" ? "risk score" : metric === "peak" ? "peak temperature" : "average temperature"}
                </span>
                <span className="font-mono text-[10.5px] text-ink-4">
                  {metric === "risk" ? "0–100" : "°C"}
                </span>
              </div>

              <div className="max-h-[440px] overflow-y-auto px-4 py-1">
                {ranked.map((zone, index) => {
                  const value = METRIC_FIELD[metric](zone);
                  const pct = spread > 0 ? ((value - rangeBottom) / spread) * 100 : 0;
                  return (
                    <div
                      key={zone.id}
                      id={`zone-row-${zone.id}`}
                      className={`grid grid-cols-[26px_1fr_120px_58px] items-center gap-2.5 border-b border-line-soft py-2.5 last:border-none ${
                        zone.id === highlightedZoneId
                          ? "-mx-2 rounded-lg bg-accent/10 px-2 ring-1 ring-accent/40"
                          : ""
                      }`}
                    >
                      <span className="font-mono text-[10.5px] text-ink-5">{index + 1}</span>
                      <span className="truncate text-[12.5px] text-ink-2">{zoneLabel(zone)}</span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-line-soft">
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${Math.max(4, pct)}%`,
                            backgroundColor:
                              pct > 75 ? "var(--heat-4)" : pct > 45 ? "var(--heat-3)" : "var(--heat-2)",
                          }}
                        />
                      </span>
                      <span className="text-right font-mono text-[12px] tabular-nums text-ink">
                        {value.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-surface p-4">
                <div className="text-[13.5px] font-semibold text-ink">Cooling coverage gap</div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-3">
                  Zones further than 800 m from the nearest cooling location in OpenStreetMap.
                </p>
                <div className="mt-3 space-y-2">
                  {gapZones.map(({ zone, km }) => (
                    <div key={zone.id} className="flex items-center justify-between text-[12px]">
                      <span className="text-ink-2">{zoneLabel(zone)}</span>
                      <span className="font-mono text-heat-3">{km.toFixed(2)} km</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <SectionLabel>Recommended actions for {zoneLabel(highestRisk)}</SectionLabel>
              <span className="text-[10.5px] text-ink-4">
                highest risk score &middot; {highestRisk.riskScore?.toFixed(1)}
              </span>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {highestRisk.topDrivers.map((entry) => (
                <div key={entry.driver} className="rounded-xl border border-line bg-surface p-4">
                  <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-accent">
                    {entry.driver}
                  </span>
                  <p className="mt-2.5 text-[12px] leading-relaxed text-ink-2 text-pretty">
                    {entry.recommendation}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-ink-5">
              Risk scores and recommendations come from the IsoTherm risk engine. Weights are transparent
              prototype values, not medically validated thresholds.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
