"use client";

import { useEffect, useRef, useState } from "react";
import { useJson } from "@/lib/useJson";
import { searchPlaces } from "@/lib/search";
import { SearchIcon } from "./icons";
import type { Place, PlacesFile } from "@/lib/types";

type SearchBoxProps = {
  onSelect: (place: Place) => void;
  placeholder?: string;
};

export function SearchBox({ onSelect, placeholder = "Search a place or street" }: SearchBoxProps) {
  const [engaged, setEngaged] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const state = useJson<PlacesFile>(engaged ? "/data/places.json" : null);
  const places: Place[] = state.status === "ready" ? state.data.places : [];
  const results = searchPlaces(places, query);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectPlace(place: Place) {
    setQuery(place.name);
    setOpen(false);
    onSelect(place);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5">
        <SearchIcon size={14} className="shrink-0 text-ink-4" />
        <input
          value={query}
          onFocus={() => {
            setEngaged(true);
            setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent text-[12.5px] text-ink placeholder:text-ink-4 focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="shrink-0 text-[11px] text-ink-4 transition-colors hover:text-ink-2"
          >
            Clear
          </button>
        ) : null}
      </div>

      {open && query.trim().length >= 2 ? (
        <div className="absolute top-[calc(100%+6px)] left-0 z-20 max-h-[320px] w-full min-w-[260px] overflow-y-auto rounded-xl border border-line bg-surface shadow-lg">
          {state.status === "loading" ? (
            <div className="px-3 py-3 text-[12px] text-ink-4">Loading places…</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-3 text-[12px] text-ink-4">No matches for &ldquo;{query}&rdquo;</div>
          ) : (
            results.map((place, index) => (
              <button
                key={`${place.name}-${index}`}
                type="button"
                onClick={() => selectPlace(place)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-2"
              >
                <span className="truncate text-[12.5px] text-ink-2">{place.name}</span>
                <span className="shrink-0 text-[10px] uppercase tracking-[0.06em] text-ink-5">
                  {place.kind}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
