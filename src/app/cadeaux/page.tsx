import GiftCarousel from "@/components/GiftCarousel/GiftCarousel";
import ItemShop from "@/components/ItemShop/ItemShop";
import PageTransition from "@/components/PageTransition/PageTransition";
import PointsCard from "@/components/PointsCard/PointsCard";
import SectionTitle from "@/components/SectionTitle/SectionTitle";
import TabHeader from "@/components/TabHeader/TabHeader";
import styles from "./page.module.css";

export default function Page() {
  return (
    <PageTransition>
      <main className={styles.page}>
        <TabHeader title="Tes cadeaux" />
        <PointsCard />
        <section className={styles.section}>
          <SectionTitle title="Mes histoires offertes" link={{ label: "Ma collection", href: "/cadeaux/collection" }} />
          <GiftCarousel />
        </section>
        <section className={styles.section}>
          <SectionTitle title="Boutique d’items" subtitle="Échange tes points contre des éléments uniques." />
          <ItemShop />
        </section>
      </main>
    </PageTransition>
  );
}
