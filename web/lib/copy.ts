import type { ReportCategory, WarningSign } from "./types";

export const REPORT_CATEGORIES: ReportCategory[] = [
  { id: "no-shade", label: "No shade" },
  { id: "no-water", label: "No water point" },
  { id: "unsafe-site", label: "Unsafe work site" },
  { id: "hot-indoors", label: "Unbearable indoors" },
  { id: "cooling-shut", label: "Cooling centre shut" },
  { id: "no-cover", label: "Bus stop, no cover" },
];

export const WARNING_SIGNS: WarningSign[] = [
  { title: "Confusion or stumbling", body: "Slurred speech, trouble following simple instructions, or unsteady walking." },
  { title: "Skin hot and dry", body: "Sweating has stopped even though it is still hot. Treat this as an emergency." },
  { title: "Vomiting or fainting", body: "Move the person to shade, cool them with water, and call for help immediately." },
];
