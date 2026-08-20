import { NavBar } from "@/components/NavBar";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export default function MapPage() {
  return (
    <>
      <NavBar />
      <PagePlaceholder
        title="Heat vulnerability map"
        description="Live FortyGuard temperature tiles over Houston, TX, with community-submitted hazard reports. Coming in feat/heat-map."
        branch="feat/heat-map"
      />
    </>
  );
}
