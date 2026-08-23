"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionLabel } from "@/components/SectionLabel";
import { Pending } from "@/components/Pending";
import { WarningIcon, DropIcon, ClockIcon, InfoIcon } from "@/components/icons";
import { WARNING_SIGNS } from "@/lib/copy";
import { ZONES, nearestRelief, nearestZone, reliefLabel, zoneLabel } from "@/lib/realData";

export default function SafetyPage() {
  const [zoneId, setZoneId] = useState(ZONES[0].id);
  const zone = ZONES.find((item) => item.id === zoneId) ?? ZONES[0];
  const relief = nearestRelief(zone.lat, zone.lon, 4);
  const coolest = ZONES[ZONES.length - 1];

  const rail = (
    <div className="space-y-5">
      <div>
        <SectionLabel>Select zone</SectionLabel>
        <div className="mt-2 max-h-[320px] space-y-0.5 overflow-y-auto">
          {ZONES.map((item) => {
            const active = item.id === zoneId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setZoneId(item.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                  active ? "bg-surface-2" : "hover:bg-surface-2/60"
                }`}
              >
                <span className={`text-[12.5px] ${active ? "font-medium text-ink" : "text-ink-2"}`}>
                  {zoneLabel(item)}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-ink-4">
                  {item.peakMax.toFixed(1)}°
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-line p-3">
        <p className="text-[11px] leading-relaxed text-ink-4">
          Thresholds will follow OSHA and NIOSH guidance for outdoor work.
        </p>
      </div>
    </div>
  );

  return (
    <AppShell
      rail={rail}
      searchPlaceholder="Search your work area"
      onPlaceSelect={(place) => setZoneId(nearestZone(place.lat, place.lon).id)}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-5 lg:px-6">
          <h1 className="text-[21px] font-semibold tracking-tight text-ink text-balance">
            Worker safety companion
          </h1>
          <p className="mt-1 text-[12.5px] text-ink-3">
            General heat-safety guidance for outdoor work in {zoneLabel(zone)}
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.25fr_1fr]">
            <div className="rounded-xl border border-line bg-surface p-5">
              <div className="flex items-center gap-2">
                <WarningIcon size={14} className="text-ink-4" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.11em] text-ink-4">
                  Risk level
                </span>
              </div>

              <div className="mt-3">
                <Pending reason="Risk needs wet-bulb, heat index and humidity from FortyGuard's env_params endpoint. Temperature alone cannot tell you if it is safe to work." />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-4 border-t border-line pt-4">
                <div>
                  <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-ink-4">Peak</div>
                  <div className="mt-1.5 font-mono text-[24px] font-medium tabular-nums text-ink">
                    {zone.peakMax.toFixed(1)}°
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-ink-4">Average</div>
                  <div className="mt-1.5 font-mono text-[24px] font-medium tabular-nums text-ink-2">
                    {zone.meanTemp.toFixed(1)}°
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-ink-4">vs coolest</div>
                  <div className="mt-1.5 font-mono text-[24px] font-medium tabular-nums text-heat-3">
                    +{(zone.peakMean - coolest.peakMean).toFixed(1)}°
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-center gap-2">
                  <ClockIcon size={14} className="text-accent" />
                  <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-ink-4">
                    Work / rest
                  </span>
                </div>
                <div className="mt-3 font-mono text-[15px] text-ink-4">—</div>
                <p className="mt-1.5 text-[10.5px] leading-relaxed text-ink-4">Needs risk level first</p>
              </div>

              <div className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-center gap-2">
                  <DropIcon size={14} className="text-accent" />
                  <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-ink-4">Hydration</span>
                </div>
                <div className="mt-3 font-mono text-[15px] text-ink-4">—</div>
                <p className="mt-1.5 text-[10.5px] leading-relaxed text-ink-4">Needs risk level first</p>
              </div>

              <div className="col-span-2 rounded-xl border border-line bg-surface p-4">
                <SectionLabel>Next hours</SectionLabel>
                <div className="mt-2.5">
                  <Pending reason="Forecast needs a same-day heatmap call. The current data is a 14-day aggregate." />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <SectionLabel>Stop work and get shade if you see</SectionLabel>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {WARNING_SIGNS.map((sign) => (
                <div
                  key={sign.title}
                  className="rounded-xl border border-line border-t-2 border-t-heat-3 bg-surface p-4"
                >
                  <div className="text-[13.5px] font-semibold text-ink">{sign.title}</div>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-3 text-pretty">{sign.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-dashed border-line px-3.5 py-3">
              <InfoIcon size={14} className="mt-0.5 shrink-0 text-ink-4" />
              <p className="text-[11.5px] leading-relaxed text-ink-3 text-pretty">
                General heat-safety guidance, not medical advice. If someone collapses, stops sweating, or cannot
                be roused, call emergency services immediately.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-line bg-surface p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[13.5px] font-semibold text-ink">Nearest relief</span>
              <span className="text-[10.5px] text-ink-4">from {zoneLabel(zone)}</span>
            </div>
            <div className="mt-3 space-y-2">
              {relief.map(({ point, distanceLabel: dist }, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 border-b border-line-soft pb-2 text-[12.5px] last:border-none last:pb-0"
                >
                  <span className="truncate text-ink-2">{reliefLabel(point)}</span>
                  <span className="shrink-0 font-mono text-ink-4">{dist}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10.5px] text-ink-5">
              Cooling locations, water points and shelters from OpenStreetMap.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
