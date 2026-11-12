import Image from "next/image";
import OAuthButtons from "@/components/OAuthButtons/OAuthButtons";
import styles from "./connexion.module.css";

export default function Welcome() {
  return (
    <main className={styles.welcomePage}>
      <div className={styles.visual} aria-hidden="true">
        <div className={styles.stage}>
          <span className={styles.circle} />
          <div className={styles.mascot}>
            <Image src="/images/mascottes/casque.webp" alt="" width={410} height={426} priority />
          </div>
        </div>
      </div>

      <div className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>BIENVENUE SUR BLUNI</h1>
        <p className={styles.welcomeText}>Raconte les anecdotes de ta route, écoute les histoires qu’elles deviennent.</p>
      </div>

      <div className={styles.actions}>
        <OAuthButtons />
      </div>
    </main>
  );
}
