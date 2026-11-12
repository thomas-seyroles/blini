import Link from "next/link";
import { notFound } from "next/navigation";
import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import Cover from "@/components/Cover/Cover";
import StoryAction from "@/components/StoryAction/StoryAction";
import StoryRow from "@/components/StoryRow/StoryRow";
import { minutes, synopsis } from "@/lib/stories";
import { getCatalogIndex } from "@/server/queries/catalog";
import styles from "../../page.module.css";

// Page lue depuis l’URL : rendu à la demande, sans validation de navigation instantanée
export const instant = false;

export default async function StoryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { packById, storyById, regionName } = await getCatalogIndex();
  const pack = packById(id);
  const story = storyById(id);
  const item = pack ?? story;
  if (!item) notFound();

  const total = pack ? pack.storyIds.reduce((n, s) => n + (storyById(s)?.durationSec ?? 0), 0) : story!.durationSec;

  return (
    <FlowPage>
      <FlowHeader title={pack ? "Pack région" : "Histoire"} backHref="/histoires/boutique" />
      <Cover regionSlug={item.regionSlug} className={styles.hero} sizes="390px" />
      <h2 className={styles.title}>{item.title}</h2>
      <p className={styles.meta}>
        {pack
          ? `${pack.storyIds.length} histoires · ${minutes(total)} d’écoute · badge région inclus`
          : `${story!.author} · ${story!.age} · ${minutes(total)}`}
      </p>
      <p className={styles.text}>
        {pack
          ? `Toutes les histoires de ${regionName(pack.regionSlug)} en un seul achat, plus le badge de la région pour ta collection.`
          : synopsis(story!, regionName(story!.regionSlug))}
      </p>
      <StoryAction kind={pack ? "pack" : "story"} id={id} large />
      {pack && (
        <>
          <h3 className={styles.title}>Histoires incluses</h3>
          <ul className={styles.list}>
            {pack.storyIds.map((s) => <StoryRow key={s} kind="story" id={s} />)}
          </ul>
        </>
      )}
      <Link href={`/histoires/region/${item.regionSlug}`} transitionTypes={["nav-forward"]} className={styles.meta}>
        Voir toutes les histoires de {regionName(item.regionSlug)}
      </Link>
      <div className={styles.spacer} />
    </FlowPage>
  );
}
