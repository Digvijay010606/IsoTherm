import Link from "next/link";

const links = [
  { href: "/", label: "Heat map" },
  { href: "/impact", label: "Impact" },
  { href: "/safety", label: "Worker safety" },
  { href: "/report", label: "Report" },
];

export function NavBar() {
  return (
    <header className="flex items-center gap-5 border-b border-line-soft px-5 py-3">
      <span className="text-[15px] font-semibold tracking-tight text-ink">
        Chhaya
      </span>
      <nav className="flex items-center gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-2 text-[13px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink-2"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
