import type { ReactNode } from "react";
import styles from "./TabHeader.module.css";

// En-tête commun des pages d’onglet : titre en police de titre. children = illustration éventuelle.
export default function TabHeader({ title, children }: { title: string; children?: ReactNode }) {
    return (
        <header className={styles.root}>
            <h1 className={styles.title}>{title}</h1>
            {children}
        </header>
    );
}
