import EmptyState from "@/components/EmptyState/EmptyState";
import FlowPage from "@/components/FlowPage/FlowPage";

export default function NotFound() {
  return (
    <FlowPage>
      <EmptyState title="Page introuvable" text="Cette page n’existe pas ou a été déplacée." action={{ label: "Retour à l’accueil", href: "/" }} />
    </FlowPage>
  );
}
