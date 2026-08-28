import { DropIcon } from "./icons";
import { CONDITIONS } from "@/lib/realData";

const EXTREME_WET_BULB = 31;

export function AreaConditions() {
  if (!CONDITIONS?.wetBulbMax) return null;

  const headroom = (EXTREME_WET_BULB - CONDITIONS.wetBulbMax).toFixed(1);

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-line bg-surface p-4">
      <DropIcon size={14} className="mt-0.5 shrink-0 text-accent" />
      <div>
        <p className="text-[11.5px] leading-relaxed text-ink-3 text-pretty">
          City-wide wet-bulb peaked at {CONDITIONS.wetBulbMax}°C &mdash; {headroom}°C below the
          level usually treated as extreme risk, so sweat still evaporates freely. Heat stress here
          is driven by air temperature rather than humidity, so shade and water matter more than
          shortened shifts.
        </p>
        <p className="mt-2 text-[10px] leading-relaxed text-ink-5">
          FortyGuard env_params, sampled {CONDITIONS.sampleDate}, {CONDITIONS.humidityMean}% mean
          relative humidity. Area-wide rather than per zone.
        </p>
      </div>
    </div>
  );
}
