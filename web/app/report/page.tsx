import { NavBar } from "@/components/NavBar";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export default function ReportPage() {
  return (
    <>
      <NavBar />
      <PagePlaceholder
        title="Report a condition"
        description="Flag a hazard anonymously. No name or sign-in required. Coming in feat/community-reports."
        branch="feat/community-reports"
      />
    </>
  );
}
