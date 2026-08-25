import { parseRecommendation } from "@/lib/recommendations";

export function RecommendedActions({ text }: { text: string | null }) {
  if (!text) return null;

  const { finding, actions } = parseRecommendation(text);

  return (
    <div>
      <p className="text-[11.5px] leading-relaxed text-ink-4 text-pretty">{finding}</p>

      {actions.length > 0 ? (
        <ol className="mt-2 space-y-1.5">
          {actions.map((action, index) => (
            <li key={action} className="flex gap-2">
              <span className="mt-[3px] font-mono text-[10px] leading-none text-ink-5">
                {index + 1}
              </span>
              <span className="text-[11.5px] leading-relaxed text-ink-2 text-pretty">{action}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
