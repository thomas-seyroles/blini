import { notFound } from "next/navigation";
import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import Cover from "@/components/Cover/Cover";
import StoryRow from "@/components/StoryRow/StoryRow";
import { getCatalogIndex } from "@/server/queries/catalog";
import styles from "../../page.module.css";

// Page lue depuis l’URL : rendu à la demande, sans validation de navigation instantanée
export const instant = false;

export default async function RegionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { packOfRegion, regionBySlug, storiesOfRegion } = await getCatalogIndex();
  const region = regionBySlug(slug);
  if (!region) notFound();
  const list = storiesOfRegion(slug);
  const pack = packOfRegion(slug);

  return (
    <FlowPage>
      <FlowHeader title={region.name} backHref="/histoires/boutique" />
      <Cover regionSlug={slug} className={styles.hero} sizes="390px" />
      <p className={styles.meta}>{list.length} histoires nées d’anecdotes de voyageurs</p>
      {pack && (
        <ul className={styles.list}>
          <StoryRow kind="pack" id={pack.id} />
        </ul>
      )}
      <h2 className={styles.title}>Les histoires</h2>
      <ul className={styles.list}>
        {list.map((s) => <StoryRow key={s.id} kind="story" id={s.id} />)}
      </ul>
      <div className={styles.spacer} />
    </FlowPage>
  );
}
