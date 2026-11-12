import { notFound } from "next/navigation";
import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import ItemDetail from "@/components/ItemDetail/ItemDetail";
import { getCatalogIndex } from "@/server/queries/catalog";
import sub from "../../sub.module.css";

// Page lue depuis l’URL : rendu à la demande, sans validation de navigation instantanée
export const instant = false;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = (await getCatalogIndex()).itemById(id);
  if (!item) notFound();

  return (
    <FlowPage>
      <FlowHeader title="Détail de l’item" backHref="/cadeaux" />
      <ItemDetail item={item} />
      <div className={sub.spacer} />
    </FlowPage>
  );
}
