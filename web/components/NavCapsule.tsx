"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapIcon, ChartIcon, ShieldIcon, ReportIcon } from "./icons";

const LINKS = [
  { href: "/", label: "Map", icon: MapIcon },
  { href: "/impact", label: "Impact", icon: ChartIcon },
  { href: "/safety", label: "Safety", icon: ShieldIcon },
  { href: "/report", label: "Report", icon: ReportIcon },
];

export function NavCapsule() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-1">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-colors ${
              active ? "bg-surface-2" : "hover:bg-surface-2/60"
            }`}
          >
            <Icon size={14} className={active ? "text-accent" : "text-ink-4"} />
            <span className={`text-[11.5px] leading-none ${active ? "font-medium text-ink" : "text-ink-4"}`}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
