"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionLabel } from "@/components/SectionLabel";
import { Pending } from "@/components/Pending";
import { ZONES, coolingGapZones, zoneLabel } from "@/lib/realData";
import { TEMPERATURE_METRICS } from "@/lib/heatLayers";
import type { HeatLayerId } from "@/lib/types";

const METRIC_FIELD: Record<HeatLayerId, (zone: (typeof ZONES)[number]) => number> = {
  peak: (zone) => zone.peakMean,
  mean: (zone) => zone.meanTemp,
  low: (zone) => zone.meanTemp,
};

export default function ImpactPage() {
  const [metric, setMetric] = useState<HeatLayerId>("peak");

  const ranked = [...ZONES].sort((a, b) => METRIC_FIELD[metric](b) - METRIC_FIELD[metric](a));
  const hottest = ranked[0];
  const coolest = ranked[ranked.length - 1];
  const spread = METRIC_FIELD[metric](hottest) - METRIC_FIELD[metric](coolest);
  const gapZones = coolingGapZones();

  const rail = (
    <div className="space-y-5">
      <div>
        <SectionLabel>Rank by</SectionLabel>
        <div className="mt-2 space-y-0.5">
          {TEMPERATURE_METRICS.filter((option) => option.id !== "low").map((option) => {
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
    <AppShell rail={rail}>
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
                {spread.toFixed(1)}°C
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
              <SectionLabel>Shade debt</SectionLabel>
              <div className="mt-2 font-mono text-[24px] font-medium text-ink-4">—</div>
              <div className="mt-1 text-[11.5px] text-ink-4">Needs wet-bulb data</div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-xl border border-line bg-surface">
              <div className="flex items-baseline justify-between border-b border-line px-4 py-3">
                <span className="text-[13.5px] font-semibold text-ink">
                  Zones ranked by {metric === "peak" ? "peak" : "average"} temperature
                </span>
                <span className="font-mono text-[10.5px] text-ink-4">°C</span>
              </div>

              <div className="max-h-[440px] overflow-y-auto px-4 py-1">
                {ranked.map((zone, index) => {
                  const value = METRIC_FIELD[metric](zone);
                  const pct = spread > 0 ? ((value - METRIC_FIELD[metric](coolest)) / spread) * 100 : 0;
                  return (
                    <div
                      key={zone.id}
                      className="grid grid-cols-[26px_1fr_120px_58px] items-center gap-2.5 border-b border-line-soft py-2.5 last:border-none"
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

              <div className="rounded-xl border border-line bg-surface p-4">
                <div className="text-[13.5px] font-semibold text-ink">Community reports</div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-3">
                  Repeat reports will weight this ranking once reporting is connected.
                </p>
                <div className="mt-3">
                  <Pending reason="Needs the community-reports feature wired up." />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <SectionLabel>Recommended focus</SectionLabel>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-line bg-surface p-4">
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-accent">
                  Shift timing
                </span>
                <div className="mt-2.5 text-[13.5px] font-semibold leading-snug text-ink text-pretty">
                  Move outdoor work earlier in {zoneLabel(hottest)}
                </div>
                <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3 text-pretty">
                  The hottest measured zone, peaking at {hottest.peakMax.toFixed(1)}°C. Becomes a specific
                  start-time once peak-hour data lands.
                </p>
              </div>

              <div className="rounded-xl border border-line bg-surface p-4">
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-heat-2">
                  Cooling access
                </span>
                <div className="mt-2.5 text-[13.5px] font-semibold leading-snug text-ink text-pretty">
                  Close the gap in {gapZones.length} zones
                </div>
                <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3 text-pretty">
                  {gapZones.length} of {ZONES.length} zones sit over 800 m from cooling, the furthest being{" "}
                  {zoneLabel(gapZones[0].zone)} at {gapZones[0].km.toFixed(2)} km.
                </p>
              </div>

              <div className="rounded-xl border border-line bg-surface p-4">
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-heat-1">
                  Community signal
                </span>
                <div className="mt-2.5 text-[13.5px] font-semibold leading-snug text-ink text-pretty">
                  Prioritise by resident reports
                </div>
                <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3 text-pretty">
                  Residents see hazards the temperature grid cannot — missing shade, broken taps, shut centres.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
