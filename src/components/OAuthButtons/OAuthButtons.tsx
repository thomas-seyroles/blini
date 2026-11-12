import Image from "next/image";
import Link from "next/link";
import styles from "./OAuthButtons.module.css";

// Connexion fictive via BlaBlaCar ou Lunii : mène au choix d'un compte de test lié au service
export default function OAuthButtons() {
    return (
        <div className={styles.root}>
            <Link href="/connexion/blablacar" transitionTypes={["nav-forward"]} className={styles.button}>
                <span className={styles.logo}>
                    <Image src="/images/logos/connexion-blablacar.webp" alt="" width={29} height={29} />
                </span>
                BlaBlaCar
            </Link>
            <Link href="/connexion/lunii" transitionTypes={["nav-forward"]} className={styles.button}>
                <span className={`${styles.logo} ${styles.lunii}`}>
                    <Image src="/images/logos/connexion-lunii.webp" alt="" width={40} height={40} />
                </span>
                Lunii
            </Link>
        </div>
    );
}
