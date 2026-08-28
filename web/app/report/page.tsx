"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionLabel } from "@/components/SectionLabel";
import { Chip } from "@/components/Chip";
import { ZoneThumb } from "@/components/ZoneThumb";
import { CameraIcon, CheckIcon, ArrowRightIcon, CloseIcon } from "@/components/icons";
import { REPORT_CATEGORIES } from "@/lib/copy";
import { ZONES, nearestZone, zoneLabel } from "@/lib/realData";
import { MAX_PHOTO_BYTES, submitReport } from "@/lib/reports";
import { supabaseReady } from "@/lib/supabase";
import type { ReportCategoryId } from "@/lib/types";

export default function ReportPage() {
  const [categoryId, setCategoryId] = useState<ReportCategoryId | null>(null);
  const [zoneId, setZoneId] = useState(ZONES[0].id);
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const whereRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function attachPhoto(file: File | null) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = file ? URL.createObjectURL(file) : null;
    setPhoto(file);
    setPhotoPreview(previewUrlRef.current);
  }

  function clearPhoto() {
    attachPhoto(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  function choosePhoto(file: File | null) {
    setError(null);
    if (!file) return clearPhoto();
    if (!file.type.startsWith("image/")) {
      setError("Only image files can be attached.");
      return clearPhoto();
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("That photo is larger than 5 MB.");
      return clearPhoto();
    }
    attachPhoto(file);
  }

  function resetForm() {
    setSubmitted(false);
    setCategoryId(null);
    setDetail("");
    setError(null);
    clearPhoto();
  }

  async function handleSubmit() {
    if (!categoryId) return;
    setError(null);

    if (!supabaseReady) {
      setSubmitted(true);
      return;
    }

    setPending(true);
    try {
      await submitReport({ categoryId, detail, zoneId, photo });
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The report could not be sent.");
    } finally {
      setPending(false);
    }
  }

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
                  {supabaseReady
                    ? "Published anonymously. It is on the map now, rounded to your zone."
                    : "Recorded for this demo. Submissions are not saved to a shared database."}
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
                  onClick={resetForm}
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
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(event) => choosePhoto(event.target.files?.[0] ?? null)}
                    />

                    {photo && photoPreview ? (
                      <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-line bg-app p-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoPreview}
                          alt="Attached photo preview"
                          className="size-12 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12.5px] text-ink">{photo.name}</div>
                          <div className="font-mono text-[10.5px] text-ink-4">
                            {(photo.size / 1024).toFixed(0)} KB
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearPhoto}
                          aria-label="Remove photo"
                          className="shrink-0 rounded-lg border border-line p-1.5 text-ink-4 transition-colors hover:border-ink-4 hover:text-ink"
                        >
                          <CloseIcon size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line text-[13px] text-ink-3 transition-colors hover:border-ink-4 hover:text-ink"
                      >
                        <CameraIcon size={15} />
                        Add a photo
                      </button>
                    )}
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

                {error ? (
                  <div className="mt-4 rounded-xl border border-danger-ink/40 bg-danger-ink/10 px-3.5 py-3 text-[12.5px] leading-relaxed text-danger-ink">
                    {error} Your report has not been sent &mdash; nothing you typed was lost.
                  </div>
                ) : null}

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    disabled={!categoryId || pending}
                    onClick={handleSubmit}
                    className="flex h-12 flex-1 items-center justify-center rounded-xl bg-accent text-[14px] font-semibold text-accent-ink transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {pending ? "Sending…" : "Submit report"}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={resetForm}
                    className="h-12 rounded-xl border border-line px-6 text-[13.5px] text-ink-3 transition-colors hover:text-ink disabled:opacity-40"
                  >
                    Cancel
                  </button>
                </div>

                <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-5">
                  {supabaseReady
                    ? "Reports are published anonymously and appear on the map for everyone."
                    : "Submissions are recorded for this demo and are not saved to a shared database."}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
