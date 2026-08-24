"use client";

import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionLabel } from "@/components/SectionLabel";
import { Chip } from "@/components/Chip";
import { ZoneThumb } from "@/components/ZoneThumb";
import { CameraIcon, CheckIcon, ArrowRightIcon } from "@/components/icons";
import { REPORT_CATEGORIES } from "@/lib/copy";
import { ZONES, nearestZone, zoneLabel } from "@/lib/realData";
import type { ReportCategoryId } from "@/lib/types";

export default function ReportPage() {
  const [categoryId, setCategoryId] = useState<ReportCategoryId | null>("no-shade");
  const [zoneId, setZoneId] = useState(ZONES[0].id);
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const whereRef = useRef<HTMLDivElement>(null);

  const zone = ZONES.find((item) => item.id === zoneId) ?? ZONES[0];
  const category = REPORT_CATEGORIES.find((item) => item.id === categoryId);
  const now = new Date();
  const timeLabel = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  function focusZone(id: string) {
    setZoneId(id);
    requestAnimationFrame(() => {
      whereRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

  return (
    <AppShell
      searchPlaceholder="Search where the problem is"
      onPlaceSelect={(place) => focusZone(nearestZone(place.lat, place.lon).id)}
    >
      <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto p-4">
        <div className="w-full max-w-[620px] rounded-2xl border border-line bg-surface">
          {submitted && category ? (
            <>
              <div className="px-7 pt-8 pb-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent/15">
                  <CheckIcon size={24} className="text-accent" />
                </div>
                <h1 className="mt-4 text-[20px] font-semibold tracking-tight text-ink">Report submitted</h1>
                <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ink-3 text-pretty">
                  Recorded locally in this session. It reaches the shared public map once community reporting is
                  connected to a database.
                </p>
              </div>

              <div className="mx-6 grid grid-cols-3 divide-x divide-line rounded-xl border border-line">
                <div className="p-3.5">
                  <SectionLabel>Condition</SectionLabel>
                  <div className="mt-1.5 text-[13px] font-medium text-ink">{category.label}</div>
                </div>
                <div className="min-w-0 p-3.5">
                  <SectionLabel>Zone</SectionLabel>
                  <div className="mt-1.5 truncate text-[13px] font-medium text-ink" title={zoneLabel(zone)}>
                    {zoneLabel(zone)}
                  </div>
                </div>
                <div className="p-3.5">
                  <SectionLabel>Logged</SectionLabel>
                  <div className="mt-1.5 font-mono text-[13px] text-ink">{timeLabel}</div>
                </div>
              </div>

              <div className="p-6">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setCategoryId(null);
                    setDetail("");
                  }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-[14px] font-semibold text-accent-ink transition-[filter] hover:brightness-110"
                >
                  Report something else
                  <ArrowRightIcon size={15} />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
                <div>
                  <h1 className="text-[19px] font-semibold tracking-tight text-ink">Report a condition</h1>
                  <p className="mt-1 text-[12.5px] text-ink-3">
                    No name, no sign-in. Reports are anonymous.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryId(null);
                    setDetail("");
                  }}
                  className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-[12px] text-ink-3 transition-colors hover:border-ink-4 hover:text-ink"
                >
                  Clear
                </button>
              </div>

              <div className="px-6 py-5">
                <SectionLabel>What is the problem?</SectionLabel>
                <div className="mt-3 flex flex-wrap gap-2">
                  {REPORT_CATEGORIES.map((option) => (
                    <Chip
                      key={option.id}
                      active={categoryId === option.id}
                      onClick={() => setCategoryId(option.id)}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-[1.15fr_1fr]">
                  <div className="flex flex-col">
                    <SectionLabel>
                      Add detail <span className="normal-case tracking-normal text-ink-5">— optional</span>
                    </SectionLabel>
                    <textarea
                      value={detail}
                      onChange={(event) => setDetail(event.target.value)}
                      placeholder="No shade anywhere on the east side of the site. Nearest working water tap is a 10 minute walk."
                      className="mt-2.5 h-[108px] w-full resize-none rounded-xl border border-line bg-app p-3.5 text-[13px] leading-relaxed text-ink placeholder:text-ink-5 focus:border-accent focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled
                      className="mt-2.5 flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-dashed border-line text-[13px] text-ink-4"
                    >
                      <CameraIcon size={15} />
                      Add a photo
                    </button>
                  </div>

                  <div ref={whereRef} className="flex flex-col">
                    <SectionLabel>Where</SectionLabel>
                    <div className="mt-2.5 overflow-hidden rounded-xl border border-line">
                      <ZoneThumb zone={zone} />
                      <div className="border-t border-line bg-app p-3">
                        <select
                          value={zoneId}
                          onChange={(event) => setZoneId(event.target.value)}
                          className="w-full bg-transparent text-[13px] font-medium text-ink focus:outline-none"
                        >
                          {ZONES.map((item) => (
                            <option key={item.id} value={item.id}>
                              {zoneLabel(item)}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-4">
                          Rounded to a 1.5 km zone so your exact location is never published.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    disabled={!categoryId}
                    onClick={() => setSubmitted(true)}
                    className="flex h-12 flex-1 items-center justify-center rounded-xl bg-accent text-[14px] font-semibold text-accent-ink transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Submit report
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryId(null);
                      setDetail("");
                    }}
                    className="h-12 rounded-xl border border-line px-6 text-[13.5px] text-ink-3 transition-colors hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>

                <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-5">
                  Submits locally for now. Connects to the shared public map once reporting is wired to a database.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
