import PageTransition from "@/components/PageTransition/PageTransition";
import TabHeader from "@/components/TabHeader/TabHeader";
import SectionTabs from "@/components/SectionTabs/SectionTabs";
import HistoiresListen from "@/components/HistoiresListen/HistoiresListen";
import styles from "./page.module.css";

export default function Page() {
  return (
    <PageTransition>
      <main className={`${styles.page} ${styles.tall}`}>
        <TabHeader title="Les histoires de ta route" />
        <SectionTabs active="ecouter" />
        <HistoiresListen />
      </main>
    </PageTransition>
  );
}
