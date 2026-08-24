"use client";

import { useEffect, useRef, useState } from "react";
import { useJson } from "@/lib/useJson";
import { searchPlaces } from "@/lib/search";
import { SearchIcon, CloseIcon } from "./icons";
import type { Place, PlacesFile } from "@/lib/types";

type SearchBoxProps = {
  onSelect: (place: Place) => void;
  placeholder?: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

export function SearchBox({
  onSelect,
  placeholder = "Search a place or street",
  expanded,
  onExpandedChange,
}: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [engaged, setEngaged] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const state = useJson<PlacesFile>(engaged ? "/data/places.json" : null);
  const places: Place[] = state.status === "ready" ? state.data.places : [];
  const results = searchPlaces(places, query);
  const showResults = expanded && listOpen && query.trim().length >= 2;

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setListOpen(false);
        onExpandedChange(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [expanded, onExpandedChange]);

  function changeExpanded(next: boolean) {
    if (next) setEngaged(true);
    else setListOpen(false);
    onExpandedChange(next);
  }

  function selectPlace(place: Place) {
    setQuery(place.name);
    setListOpen(false);
    inputRef.current?.focus();
    onSelect(place);
  }

  function clearQuery() {
    setQuery("");
    setListOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative flex items-center">
      <button
        type="button"
        aria-label={expanded ? "Close search" : "Search a place"}
        aria-expanded={expanded}
        onClick={() => changeExpanded(!expanded)}
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-ink-4 transition-colors hover:bg-surface-2 hover:text-ink-2"
      >
        {expanded ? <CloseIcon size={14} /> : <SearchIcon size={14} />}
      </button>

      <div
        className={`flex items-center overflow-hidden transition-[width,opacity] duration-200 ease-out ${
          expanded
            ? "w-[132px] opacity-100 sm:w-[176px] lg:w-[228px]"
            : "pointer-events-none w-0 opacity-0"
        }`}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setListOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            if (listOpen) setListOpen(false);
            else changeExpanded(false);
          }}
          placeholder={placeholder}
          tabIndex={expanded ? undefined : -1}
          className="w-full min-w-0 bg-transparent pl-1 text-[12.5px] text-ink placeholder:text-ink-5 focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={clearQuery}
            className="shrink-0 px-2 text-[11px] text-ink-4 transition-colors hover:text-ink-2"
          >
            Clear
          </button>
        ) : null}
      </div>

      {showResults ? (
        <div className="absolute top-[calc(100%+12px)] right-0 z-20 max-h-[320px] w-[300px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-line bg-surface shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
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
