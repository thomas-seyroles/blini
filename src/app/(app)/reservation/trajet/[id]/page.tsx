import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, Sparkles, Star } from "lucide-react";
import AboardList from "@/components/AboardList/AboardList";
import Cover from "@/components/Cover/Cover";
import EquipmentTags from "@/components/EquipmentTags/EquipmentTags";
import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import ItineraryCard from "@/components/ItineraryCard/ItineraryCard";
import ReserveBar from "@/components/ReserveBar/ReserveBar";
import { placesLabel } from "@/lib/journeys";
import { dayInfo } from "@/lib/trip";
import { getCatalogIndex } from "@/server/queries/catalog";
import { getJourney } from "@/server/queries/journeys";
import styles from "./page.module.css";

const names = (list: string[]) => (list.length < 3 ? list.join(" et ") : `${list.slice(0, 2).join(", ")} et ${list.length - 2} autre${list.length > 3 ? "s" : ""}`);

// Données vivantes (places, comptes) : rendu à la demande, sans validation de navigation instantanée
export const instant = false;

export default async function JourneyDetail({ params }: PageProps<"/reservation/trajet/[id]">) {
  const { id } = await params;
  const [journey, { regionName }] = await Promise.all([getJourney(id), getCatalogIndex()]);
  if (!journey || journey.kind === "complet") notFound();
  const regions = journey.regions.map((slug) => ({ slug, name: regionName(slug) }));
  const { driver } = journey;
  const certified = journey.kind === "certifie";
  const seats = `${placesLabel(journey.seatsLeft)} restante${journey.seatsLeft > 1 ? "s" : ""}`;

  return (
    <FlowPage>
      <FlowHeader title="Ton trajet aller" backHref="/trajets/resultats" step={1} />

      {certified && (
        <p className={styles.certified}>
          <ShieldCheck size={16} />
          Trajet certifié Bluni
        </p>
      )}

      <ItineraryCard
        day={dayInfo(journey.date).long}
        departTime={journey.departTime}
        arrivalTime={journey.arrivalTime}
        from={journey.from}
        to={journey.to}
        fromAddress={journey.fromAddress}
        toAddress={journey.toAddress}
        footer={`${journey.duration} de trajet · ${journey.km} km`}
        tone={certified ? "violet" : "yellow"}
      />

      <h2 className={styles.heading}>{driver.female ? "Ta conductrice" : "Ton conducteur"}</h2>
      <section className={styles.driver}>
        <Link href={`/reservation/trajet/${journey.id}/conducteur`} transitionTypes={["nav-forward"]} className={styles.profile}>
          <Image className={styles.photo} src={driver.photo} alt="" width={52} height={52} />
          <span className={styles.driverTexts}>
            <span className={styles.name}>{driver.name}</span>
            <span className={styles.rating}>
              <Star size={14} />
              {driver.rating} · {driver.reviews} avis · profil vérifié
            </span>
            <span className={styles.car}>{driver.car} {driver.color}</span>
          </span>
          <ChevronRight size={18} />
        </Link>
        <EquipmentTags equipments={driver.equipments} />
      </section>

      <section className={styles.stories}>
        <h2 className={styles.storiesTitle}>
          <Sparkles size={16} />
          {regions.length} histoire{regions.length > 1 ? "s" : ""} sur ta route
        </h2>
        <ul className={styles.regions}>
          {regions.map(({ slug, name }) => (
            <li key={slug} className={styles.region}>
              <Cover regionSlug={slug} className={styles.cover} sizes="130px" />
              {name}
            </li>
          ))}
        </ul>
      </section>

      <h2 className={styles.heading}>Déjà à bord</h2>
      <AboardList
        passengers={journey.aboard}
        summary={journey.aboard.length ? `${names(journey.aboard.map((p) => p.name))} · ${seats}` : `Personne pour l’instant · ${seats}`}
      />

      <div className={styles.barSpace} />
      <ReserveBar journey={journey} />
    </FlowPage>
  );
}
