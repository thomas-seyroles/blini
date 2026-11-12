import TripDetail from "@/components/TripDetail/TripDetail";
import { seedTrips } from "@/lib/trips";

export function generateStaticParams() {
  return seedTrips.map(({ id }) => ({ id }));
}

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TripDetail id={id} />;
}
