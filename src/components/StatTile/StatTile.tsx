import Link from "next/link";
import styles from "./StatTile.module.css";

type StatTileProps = { value: number; label: string; href: string }

export default function StatTile({ value, label, href }: StatTileProps) {
    return (
        <Link href={href} transitionTypes={["nav-forward"]} className={styles.root}>
            <span className={styles.value}>{value.toLocaleString("fr-FR")}</span>
            <span className={styles.label}>{label}</span>
        </Link>
    );
}
