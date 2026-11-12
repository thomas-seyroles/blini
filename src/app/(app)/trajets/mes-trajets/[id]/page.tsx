import TripDetail from "@/components/TripDetail/TripDetail";

// Page lue depuis l’URL : rendu à la demande, sans validation de navigation instantanée
export const instant = false;

export default async function TripDetailPage({ params }: PageProps<"/trajets/mes-trajets/[id]">) {
  const { id } = await params;
  return <TripDetail id={id} />;
}
