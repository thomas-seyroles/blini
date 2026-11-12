import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import PlaylistEditor from "@/components/PlaylistEditor/PlaylistEditor";

// Page lue depuis l’URL : rendu à la demande, sans validation de navigation instantanée
export const instant = false;

export default async function Page({ params }: { params: Promise<{ journeyId: string }> }) {
  const { journeyId } = await params;
  return (
    <FlowPage>
      <FlowHeader title="Préparer mes histoires" backHref="/histoires/bibliotheque" />
      <PlaylistEditor journeyId={journeyId} />
    </FlowPage>
  );
}
