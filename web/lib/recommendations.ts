const FINDING_SEPARATOR = " — ";
const ACTION_SEPARATOR = /,\s+|\s+and\s+/;

export type ParsedRecommendation = {
  finding: string;
  actions: string[];
};

export function parseRecommendation(text: string): ParsedRecommendation {
  const separatorIndex = text.indexOf(FINDING_SEPARATOR);
  if (separatorIndex === -1) return { finding: text, actions: [] };

  const finding = text.slice(0, separatorIndex);
  const actions = text
    .slice(separatorIndex + FINDING_SEPARATOR.length)
    .replace(/\.$/, "")
    .split(ACTION_SEPARATOR)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1));

  if (actions.length < 2) return { finding: text, actions: [] };
  return { finding, actions };
}
