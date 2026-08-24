"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SPLASH_ROUTE = "/";
const HOLD_MS = 1400;
const EXIT_MS = 650;
const REVEAL_MS = 240;

export function AppEntrance({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [splash] = useState(() => pathname === SPLASH_ROUTE);
  const [stage, setStage] = useState<"holding" | "leaving" | "done">(
    splash ? "holding" : "done",
  );
  const [revealed, setRevealed] = useState(!splash);

  useEffect(() => {
    if (!splash) return;
    const startExit = setTimeout(() => setStage("leaving"), HOLD_MS);
    const reveal = setTimeout(() => setRevealed(true), HOLD_MS + REVEAL_MS);
    const finish = setTimeout(() => setStage("done"), HOLD_MS + EXIT_MS);
    return () => {
      clearTimeout(startExit);
      clearTimeout(reveal);
      clearTimeout(finish);
    };
  }, [splash]);

  return (
    <>
      {stage !== "done" ? (
        <div
          aria-hidden
          className={`preloader-overlay fixed inset-0 z-50 flex items-center justify-center bg-ground ${
            stage === "leaving" ? "preloader-overlay-leaving pointer-events-none" : ""
          }`}
        >
          <div className="px-6 text-center">
            <div className="preloader-rise text-[clamp(40px,10vw,68px)] leading-none font-semibold tracking-tight text-ink">
              Chhaya
            </div>
            <p className="preloader-rise preloader-rise-late mt-4 text-[13px] text-ink-3 text-balance sm:text-[14.5px]">
              Heat Vulnerability &amp; Outdoor Worker Safety Mapper
            </p>
          </div>
        </div>
      ) : null}

      <div className={`app-content flex flex-1 flex-col ${revealed ? "app-content-revealed" : ""}`}>
        {children}
      </div>
    </>
  );
}
