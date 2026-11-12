import Image from "next/image";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import Stars from "@/components/Stars/Stars";
import EquipmentTags from "@/components/EquipmentTags/EquipmentTags";
import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import Badges from "@/components/Badges/Badges";
import { getDriverBadges, getDriverReviews, getJourney } from "@/server/queries/journeys";
import styles from "./page.module.css";

// Données vivantes (places, comptes) : rendu à la demande, sans validation de navigation instantanée
export const instant = false;

export default async function DriverProfile({ params }: PageProps<"/reservation/trajet/[id]/conducteur">) {
  const { id } = await params;
  const journey = await getJourney(id);
  if (!journey || journey.kind === "complet") notFound();

  const { driver } = journey;
  const [reviews, badges] = await Promise.all([getDriverReviews(driver.id), getDriverBadges(driver.id)]);

  return (
    <FlowPage>
      <FlowHeader title={`Profil de ${driver.name}`} backHref={`/reservation/trajet/${journey.id}`} />

      <section className={styles.identity}>
        <Image className={styles.photo} src={driver.photo} alt="" width={88} height={88} />
        <h2 className={styles.name}>{driver.name}</h2>
        <p className={styles.rating}>
          <Star size={14} />
          {driver.rating} · {driver.reviews} avis · profil vérifié
        </p>
        <p className={styles.meta}>{driver.car} {driver.color} · {driver.trips} trajets sur Bluni</p>
      </section>

      {driver.bio && <p className={styles.bio}>{driver.bio}</p>}
      <EquipmentTags equipments={driver.equipments} />

      {badges.length > 0 && (
        <>
          <h2 className={styles.heading}>Badges de région</h2>
          <Badges regionSlugs={badges} />
        </>
      )}

      {reviews.length > 0 && (
        <>
          <h2 className={styles.heading}>Avis récents</h2>
          <ul className={styles.reviews}>
            {reviews.map(({ id, author, photo, rating, text }) => (
              <li key={id} className={styles.review}>
                <Image className={styles.reviewPhoto} src={photo} alt="" width={40} height={40} />
                <div className={styles.reviewBody}>
                  <div className={styles.reviewHead}>
                    <p className={styles.author}>{author}</p>
                    <Stars rating={rating} />
                  </div>
                  <p className={styles.text}>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </FlowPage>
  );
}
