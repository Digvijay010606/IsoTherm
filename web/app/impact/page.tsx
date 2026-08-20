import { NavBar } from "@/components/NavBar";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export default function ImpactPage() {
  return (
    <>
      <NavBar />
      <PagePlaceholder
        title="Impact dashboard"
        description="Zones ranked by shade debt, reports over time, and the interventions that remove the most exposure-hours. Coming in feat/impact-dashboard."
        branch="feat/impact-dashboard"
      />
    </>
  );
}
