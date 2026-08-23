"use client";

import Link from "next/link";
import { NavCapsule } from "./NavCapsule";
import { SearchBox } from "./SearchBox";
import { PinIcon } from "./icons";
import { AREA } from "@/lib/realData";
import type { Place } from "@/lib/types";

type AppShellProps = {
  rail?: React.ReactNode;
  onPlaceSelect?: (place: Place) => void;
  searchPlaceholder?: string;
  children: React.ReactNode;
};

export function AppShell({ rail, onPlaceSelect, searchPlaceholder, children }: AppShellProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ground">
      <header className="flex shrink-0 flex-col items-center gap-2.5 border-b border-line-soft px-4 py-2.5 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-3">
        <div className="flex items-center gap-3 justify-self-start">
          <Link href="/" className="text-[15px] font-semibold tracking-tight text-ink">
            Chhaya
          </Link>
          <span className="hidden h-5 w-px bg-line md:block" />
          <div className="hidden items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 md:flex">
            <PinIcon size={13} className="text-accent" />
            <span className="text-[12.5px] text-ink">{AREA.name}</span>
          </div>
        </div>

        <div className="justify-self-center">
          <NavCapsule />
        </div>

        {onPlaceSelect ? (
          <>
            <div className="hidden justify-self-end lg:block lg:w-[280px]">
              <SearchBox onSelect={onPlaceSelect} placeholder={searchPlaceholder} />
            </div>

            <div className="w-full lg:hidden">
              <SearchBox onSelect={onPlaceSelect} placeholder={searchPlaceholder} />
            </div>
          </>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {rail ? (
          <aside className="shrink-0 overflow-y-auto border-b border-line-soft px-3 py-3 lg:w-[232px] lg:border-b-0 lg:border-r">
            {rail}
          </aside>
        ) : null}

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
