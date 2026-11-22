import PageHeader from "../../../components/ui/PageHeader";
import AlertsPage from "./AlertsPage";
import HotspotMapPage from "./HotspotMapPage";

function HotspotIntelligencePage() {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="FR-11 · FR-12"
        title="Hotspot intelligence"
        description="Review complaint clusters on the map and act on automatic threshold alerts in one place."
      />
      <HotspotMapPage embedded />
      <AlertsPage embedded />
    </div>
  );
}

export default HotspotIntelligencePage;
