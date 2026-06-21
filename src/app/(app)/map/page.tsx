import { EcoMap } from "@/components/eco-map";
import { PageHeader } from "@/components/page-header";

export default function MapPage() {
  return (
    <div>
      <PageHeader title="Eco Map" subtitle="Find recycling centres, EV chargers, transit & green spaces near you" />
      <EcoMap />
    </div>
  );
}
