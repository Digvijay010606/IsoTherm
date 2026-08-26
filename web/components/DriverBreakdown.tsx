"use client";

import { useState } from "react";
import { RecommendedActions } from "./RecommendedActions";
import type { RiskDriver } from "@/lib/types";

export function DriverBreakdown({ drivers }: { drivers: RiskDriver[] }) {
  const [openDriver, setOpenDriver] = useState<string | null>(drivers[0]?.driver ?? null);

  if (drivers.length === 0) return null;

  const widest = Math.max(...drivers.map((entry) => entry.contribution), 1);

  return (
    <div className="divide-y divide-line-soft">
      {drivers.map((entry) => {
        const open = openDriver === entry.driver;
        return (
          <div key={entry.driver}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenDriver(open ? null : entry.driver)}
              className="flex w-full items-center gap-2.5 py-2 text-left transition-colors hover:text-ink"
            >
              <span
                className={`min-w-0 flex-1 truncate text-[12px] ${
                  open ? "font-medium text-ink" : "text-ink-2"
                }`}
              >
                {entry.driver}
              </span>
              <span className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-line-soft">
                <span
                  className={`block h-full rounded-full ${open ? "bg-accent" : "bg-ink-5"}`}
                  style={{ width: `${Math.max(6, (entry.contribution / widest) * 100)}%` }}
                />
              </span>
              <span className="w-8 shrink-0 text-right font-mono text-[11px] tabular-nums text-ink-3">
                {entry.contribution}
              </span>
            </button>

            {open ? (
              <div className="pb-3">
                <RecommendedActions text={entry.recommendation} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
