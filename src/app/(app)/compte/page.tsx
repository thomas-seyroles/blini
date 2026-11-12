import AccountView from "@/components/AccountView/AccountView";
import TabHeader from "@/components/TabHeader/TabHeader";
import styles from "./page.module.css";

export default function Page() {
  return (
    <main className={styles.page}>
      <TabHeader title="Ton compte" />
      <AccountView />
    </main>
  );
}
