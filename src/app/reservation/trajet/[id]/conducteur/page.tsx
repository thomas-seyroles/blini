import Image from "next/image";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import EquipmentTags from "@/components/EquipmentTags/EquipmentTags";
import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import { driverById, journeyById, outbound } from "@/lib/journeys";
import styles from "./page.module.css";

const reviews = [
  { author: "Léa", text: "Trajet très agréable, les enfants ont adoré les histoires de la route." },
  { author: "Tom", text: "Ponctuel, voiture propre et conduite douce. Je recommande." },
  { author: "Inès", text: "On a même appris une anecdote sur la Bourgogne, super idée !" },
];

export function generateStaticParams() {
  return outbound.filter((j) => j.kind !== "complet").map(({ id }) => ({ id }));
}

export default async function DriverProfile({ params }: PageProps<"/reservation/trajet/[id]/conducteur">) {
  const { id } = await params;
  const journey = journeyById(id);
  if (!journey || journey.kind === "complet") notFound();

  const driver = driverById(journey.driverId);

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

      <p className={styles.bio}>{driver.bio}</p>
      <EquipmentTags equipments={driver.equipments} />

      <h2 className={styles.heading}>Avis récents</h2>
      <ul className={styles.reviews}>
        {reviews.map(({ author, text }) => (
          <li key={author} className={styles.review}>
            <p className={styles.author}>{author}</p>
            <p className={styles.text}>{text}</p>
          </li>
        ))}
      </ul>
    </FlowPage>
  );
}
