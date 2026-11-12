import { notFound } from "next/navigation";
import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import ItemDetail from "@/components/ItemDetail/ItemDetail";
import { itemById, items } from "@/lib/items";
import sub from "../../sub.module.css";

export function generateStaticParams() {
  return items.map(({ id }) => ({ id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = itemById(id);
  if (!item) notFound();

  return (
    <FlowPage>
      <FlowHeader title="Détail de l’item" backHref="/cadeaux" />
      <ItemDetail item={item} />
      <div className={sub.spacer} />
    </FlowPage>
  );
}
