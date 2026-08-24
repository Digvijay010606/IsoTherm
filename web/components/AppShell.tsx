"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchBox } from "./SearchBox";
import { MapIcon, ChartIcon, ShieldIcon, ReportIcon, PinIcon } from "./icons";
import { AREA } from "@/lib/realData";
import type { Place } from "@/lib/types";

const LINKS = [
  { href: "/", label: "Map", icon: MapIcon },
  { href: "/impact", label: "Impact", icon: ChartIcon },
  { href: "/safety", label: "Safety", icon: ShieldIcon },
  { href: "/report", label: "Report", icon: ReportIcon },
];

type AppShellProps = {
  rail?: React.ReactNode;
  onPlaceSelect?: (place: Place) => void;
  searchPlaceholder?: string;
  children: React.ReactNode;
};

export function AppShell({ rail, onPlaceSelect, searchPlaceholder, children }: AppShellProps) {
  const pathname = usePathname();
  const [searchExpanded, setSearchExpanded] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ground">
      <header className="relative z-30 flex shrink-0 justify-center px-4 pt-3 pb-2">
        <div className="flex max-w-full items-center gap-1 rounded-full border border-line bg-surface/95 py-1 pr-1.5 pl-3 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur">
          <Link href="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span className="text-[14px] font-semibold tracking-tight text-ink">Chhaya</span>
            <span
              className={`items-center gap-1 rounded-full bg-surface-2 py-1 pr-2.5 pl-2 ${
                searchExpanded ? "hidden lg:flex" : "hidden md:flex"
              }`}
            >
              <PinIcon size={11} className="text-accent" />
              <span className="text-[11px] leading-none text-ink-3">{AREA.name}</span>
            </span>
          </Link>

          <span className="mx-1.5 h-4 w-px shrink-0 bg-line" />

          <nav className="flex shrink-0 items-center gap-0.5">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 rounded-full px-2 py-1.5 transition-colors ${
                    active ? "bg-surface-2" : "hover:bg-surface-2/60"
                  }`}
                >
                  <Icon size={14} className={active ? "text-accent" : "text-ink-4"} />
                  <span
                    className={`text-[11.5px] leading-none whitespace-nowrap ${
                      active ? "font-medium text-ink" : "text-ink-4"
                    } ${searchExpanded ? "hidden lg:inline" : "hidden sm:inline"}`}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {onPlaceSelect ? (
            <>
              <span className="mx-1.5 h-4 w-px shrink-0 bg-line" />
              <SearchBox
                onSelect={onPlaceSelect}
                placeholder={searchPlaceholder}
                expanded={searchExpanded}
                onExpandedChange={setSearchExpanded}
              />
            </>
          ) : null}
        </div>
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
