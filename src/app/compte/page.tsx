import Image from "next/image";
import AccountView from "@/components/AccountView/AccountView";
import TabHeader from "@/components/TabHeader/TabHeader";
import styles from "./page.module.css";

export default function Page() {
  return (
    <main className={styles.page}>
      <TabHeader title="Ton compte">
        <Image src="/images/compte/mascotte-cadeau.png" alt="" width={231} height={218} className={styles.mascot} priority />
      </TabHeader>
      <AccountView />
    </main>
  );
}
