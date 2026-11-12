import Image from "next/image";
import { regionBySlug } from "@/lib/stories";
import styles from "./Cover.module.css";

type CoverProps = { regionSlug: string; className?: string; sizes?: string };

// Couverture de région, avec visuel de remplacement en CSS quand il n'y en a pas
export default function Cover({ regionSlug, className = "", sizes = "64px" }: CoverProps) {
    const region = regionBySlug(regionSlug);
    if (region?.cover) {
        return (
            <span className={`${styles.root} ${className}`}>
                <Image className={styles.image} src={region.cover} alt="" fill sizes={sizes} />
            </span>
        );
    }
    return (
        <span className={`${styles.root} ${styles.fallback} ${className}`} aria-hidden="true">
            {region?.name[0] ?? "B"}
        </span>
    );
}
