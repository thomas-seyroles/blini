import Image from "next/image";
import PageTransition from "@/components/PageTransition/PageTransition";
import Greeting from "@/components/Greeting/Greeting";
import PreviousTrips from "@/components/PreviousTrips/PreviousTrips";
import RegionCarousel from "@/components/RegionCarousel/RegionCarousel";
import SectionTitle from "@/components/SectionTitle/SectionTitle";
import TripPlanner from "@/components/TripPlanner/TripPlanner";
import { regions, storiesOfRegion } from "@/lib/stories";
import styles from "./page.module.css";

const carousel = regions.map(({ slug, name, cover }) => {
  const count = storiesOfRegion(slug).length;
  return { slug, region: name, count: `${count} histoire${count > 1 ? "s" : ""}`, cover, href: `/histoires/region/${slug}` };
});

export default function Home() {
  return (
    <PageTransition>
    <main className={styles.page}>
      <header className={styles.header}>
        <Greeting className={styles.greeting} />
        <h1 className={styles.title}>on se PRÉVOIT<br />UN BLUNI ?</h1>
        <Image className={styles.mascotCar} src="/images/mascotte-voiture.png" alt="" width={122} height={130} priority />
      </header>
      <TripPlanner />
      <Image className={styles.mascotFrance} src="/images/mascotte-france.png" alt="" width={149} height={183} />
      <section className={styles.section}>
        <SectionTitle title="Régions traversées" link={{ label: "Voir tout →", href: "/histoires/boutique" }} />
        <RegionCarousel regions={carousel} />
      </section>
      <section className={styles.section}>
        <PreviousTrips />
      </section>
    </main>
    </PageTransition>
  );
}
