import Image from "next/image";
import PageTransition from "@/components/PageTransition/PageTransition";
import Greeting from "@/components/Greeting/Greeting";
import PreviousTrips from "@/components/PreviousTrips/PreviousTrips";
import RegionCarousel from "@/components/RegionCarousel/RegionCarousel";
import SectionTitle from "@/components/SectionTitle/SectionTitle";
import TripPlanner from "@/components/TripPlanner/TripPlanner";
import { getCatalogIndex } from "@/server/queries/catalog";
import styles from "./page.module.css";

export default async function Home() {
  const { regions, storiesOfRegion } = await getCatalogIndex();
  const carousel = regions.map(({ slug, name, cover }) => {
    const count = storiesOfRegion(slug).length;
    return { slug, region: name, count: `${count} histoire${count > 1 ? "s" : ""}`, cover, href: `/histoires/region/${slug}` };
  });

  return (
    <PageTransition>
    <main className={styles.page}>
      <header className={styles.header}>
        <Greeting className={styles.greeting} />
        <h1 className={styles.title}>on se PRÉVOIT<br />UN BLUNI ?</h1>
        <Image className={styles.mascotCar} src="/images/mascottes/voiture.webp" alt="" width={122} height={130} priority />
      </header>
      <TripPlanner />
      <Image className={styles.mascotFrance} src="/images/mascottes/france.webp" alt="" width={149} height={183} />
      <section className={styles.section}>
        <SectionTitle title="Régions à traversées" link={{ label: "Voir tout →", href: "/histoires/boutique" }} />
        <RegionCarousel regions={carousel} />
      </section>
      <section className={styles.section}>
        <PreviousTrips />
      </section>
    </main>
    </PageTransition>
  );
}
