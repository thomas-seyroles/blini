import Link from "next/link";
import styles from "./SectionTabs.module.css";

const tabs = [
    { id: "ecouter", label: "Écouter", href: "/histoires" },
    { id: "bibliotheque", label: "Bibliothèque", href: "/histoires/bibliotheque" },
    { id: "boutique", label: "Boutique", href: "/histoires/boutique" },
];

export default function SectionTabs({ active }: { active: "ecouter" | "bibliotheque" | "boutique" }) {
    return (
        <nav className={styles.root} aria-label="Sections des histoires">
            {tabs.map((t) => (
                <Link key={t.id} href={t.href} aria-current={t.id === active ? "page" : undefined} className={`${styles.tab} ${t.id === active ? styles.active : ""}`}>
                    {t.label}
                </Link>
            ))}
        </nav>
    );
}
