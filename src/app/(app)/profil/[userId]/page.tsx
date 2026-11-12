import Image from "next/image";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import Badges from "@/components/Badges/Badges";
import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import StoryRow from "@/components/StoryRow/StoryRow";
import { getPublicProfile } from "@/server/queries/profiles";
import styles from "./page.module.css";

// Page lue depuis l’URL : rendu à la demande, sans validation de navigation instantanée
export const instant = false;

export default async function PublicProfile({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const profile = await getPublicProfile(userId);
  if (!profile) notFound();

  return (
    <FlowPage>
      <FlowHeader title={`Profil de ${profile.firstName}`} backHref="/histoires" />

      <section className={styles.identity}>
        <Image className={styles.photo} src={profile.photo} alt="" width={88} height={88} />
        <h2 className={styles.name}>{profile.name}</h2>
        <p className={styles.meta}>{profile.role === "conducteur" ? "Conducteur" : "Passager"} · conteur Bluni</p>
        {profile.driver && (
          <p className={styles.rating}>
            <Star size={14} />
            {profile.driver.rating.toLocaleString("fr-FR", { minimumFractionDigits: 1 })} · {profile.driver.reviews} avis · {profile.driver.car}
          </p>
        )}
      </section>

      {profile.driver?.bio && <p className={styles.bio}>{profile.driver.bio}</p>}

      <h2 className={styles.heading}>Badges de région</h2>
      {profile.badges.length ? <Badges regionSlugs={profile.badges} /> : <p className={styles.meta}>Pas encore de badge.</p>}

      <h2 className={styles.heading}>Histoires inspirées</h2>
      {profile.storyIds.length ? (
        <ul className={styles.list}>
          {profile.storyIds.map((id) => <StoryRow key={id} kind="story" id={id} />)}
        </ul>
      ) : (
        <p className={styles.meta}>Aucune histoire retenue pour l’instant.</p>
      )}
    </FlowPage>
  );
}
