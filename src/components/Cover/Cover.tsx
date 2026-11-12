"use client";

import Image from "next/image";
import { useCatalog } from "../AppState/AppState";
import styles from "./Cover.module.css";

type CoverProps = { regionSlug: string; className?: string; sizes?: string };

// Couverture de région, avec visuel de remplacement en CSS quand il n'y en a pas
export default function Cover({ regionSlug, className = "", sizes = "64px" }: CoverProps) {
    const region = useCatalog().regionBySlug(regionSlug);
    return (
        <span className={`${styles.root} ${className}`}>
            <Image className={styles.image} src={region?.cover ?? "/images/items/collection.webp"} alt="" fill sizes={sizes} />
        </span>
    );
}
