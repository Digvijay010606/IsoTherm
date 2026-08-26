"use client";

import { useMemo, useState } from "react";
import { SectionLabel } from "./SectionLabel";
import { improvableDrivers, isFlaggedDriver, leverReduction, projectRisk } from "@/lib/riskProjection";
import type { Zone } from "@/lib/types";

const IMPROVEMENT_STEPS = [25, 50, 75];

export function RiskProjection({ zone }: { zone: Zone }) {
  const [improvement, setImprovement] = useState(50);
  const [excluded, setExcluded] = useState<Set<string>>(() => new Set<string>());

  const available = useMemo(() => improvableDrivers(zone), [zone]);
  const active = available.filter((driver) => !excluded.has(driver));
  const projection = projectRisk(zone, active, improvement);

  if (available.length === 0 || !projection) return null;

  function toggle(driver: string) {
    setExcluded((current) => {
      const next = new Set(current);
      if (next.has(driver)) next.delete(driver);
      else next.add(driver);
      return next;
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[13.5px] font-semibold text-ink">If these actions are taken</div>
        <div className="flex shrink-0 gap-0.5">
          {IMPROVEMENT_STEPS.map((step) => (
            <button
              key={step}
              type="button"
              aria-pressed={improvement === step}
              onClick={() => setImprovement(step)}
              className={`rounded-md px-1.5 py-0.5 font-mono text-[10.5px] transition-colors ${
                improvement === step
                  ? "bg-accent/15 text-accent"
                  : "text-ink-5 hover:bg-surface-2 hover:text-ink-3"
              }`}
            >
              {step}%
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2.5">
        <span className="font-mono text-[15px] tabular-nums text-ink-4 line-through">
          {projection.current.toFixed(1)}
        </span>
        <span className="font-mono text-[30px] font-medium leading-none tabular-nums text-accent">
          {projection.projected.toFixed(1)}
        </span>
        <span className="font-mono text-[12px] tabular-nums text-accent">
          &minus;{projection.reduction.toFixed(1)}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        <SectionLabel>Interventions</SectionLabel>
        {available.map((driver) => {
          const on = !excluded.has(driver);
          const reduction = leverReduction(zone, driver, improvement);
          return (
            <button
              key={driver}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(driver)}
              className="flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-surface-2/60"
            >
              <span
                className={`flex size-3.5 shrink-0 items-center justify-center rounded border text-[9px] ${
                  on ? "border-accent bg-accent/20 text-accent" : "border-line text-transparent"
                }`}
              >
                ✓
              </span>
              <span className={`flex-1 text-[11.5px] ${on ? "text-ink-2" : "text-ink-5"}`}>
                {driver}
                {isFlaggedDriver(zone, driver) ? (
                  <span className="ml-1.5 text-[9.5px] tracking-[0.06em] text-heat-3 uppercase">
                    top driver
                  </span>
                ) : null}
              </span>
              <span
                className={`shrink-0 font-mono text-[10.5px] tabular-nums ${
                  on ? "text-accent" : "text-ink-5"
                }`}
              >
                &minus;{reduction.toFixed(1)}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-ink-5">
        Modelled by reducing each mapped deficit in the risk engine&rsquo;s own scoring, at its
        published weight. A projection of the score, not a measured outcome.
      </p>
    </div>
  );
}
