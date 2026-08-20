import { NavBar } from "@/components/NavBar";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export default function SafetyPage() {
  return (
    <>
      <NavBar />
      <PagePlaceholder
        title="Worker safety companion"
        description="Current risk band, work and rest cycle, hydration cadence, and the nearest cooling centre. Coming in feat/worker-safety."
        branch="feat/worker-safety"
      />
    </>
  );
}
