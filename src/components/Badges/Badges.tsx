"use client";

import Cover from "../Cover/Cover";
import { useCatalog } from "../AppState/AppState";
import styles from "./Badges.module.css";

// Badges de région : un par collection complète achetée
export default function Badges({ regionSlugs }: { regionSlugs: string[] }) {
    const { regionName } = useCatalog();
    return (
        <ul className={styles.root}>
            {regionSlugs.map((slug) => (
                <li key={slug} className={styles.badge}>
                    <Cover regionSlug={slug} className={styles.cover} sizes="64px" />
                    <span className={styles.name}>{regionName(slug)}</span>
                </li>
            ))}
        </ul>
    );
}
