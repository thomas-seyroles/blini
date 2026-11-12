"use client";

import Link from "next/link";
import { ChevronRight, Gift, Lock, PackageCheck } from "lucide-react";
import { PACKAGE_MIN_TRIPS, packageStatus } from "@/lib/package";
import { useApp } from "../AppState/AppState";
import styles from "./PackageCta.module.css";

// "card" (Compte) montre tous les états ; "banner" (Cadeaux, Raconter) n'apparaît que si le package est à réclamer
export default function PackageCta({ variant }: { variant: "card" | "banner" }) {
    const { state } = useApp();
    const { eligible, ordered, trips, linked } = packageStatus(state);

    if (variant === "banner" && (!eligible || ordered)) return null;

    if (variant === "card" && !eligible) {
        return (
            <div className={`${styles.root} ${styles.locked}`}>
                <Lock size={22} />
                <span className={styles.texts}>
                    <strong>Package Lunii pour conducteurs</strong>
                    <small>{linked ? `Réservé aux conducteurs vérifiés : ${trips} / ${PACKAGE_MIN_TRIPS} trajets BlaBlaCar` : `Lie ton compte BlaBlaCar : ${PACKAGE_MIN_TRIPS} trajets complétés requis`}</small>
                    <progress className={styles.progress} max={PACKAGE_MIN_TRIPS} value={trips} aria-label="Trajets BlaBlaCar complétés" />
                </span>
            </div>
        );
    }

    const Icon = ordered ? PackageCheck : Gift;
    return (
        <Link href="/compte/package" transitionTypes={["nav-forward"]} className={`${styles.root} ${styles.open}`}>
            <Icon size={22} />
            <span className={styles.texts}>
                <strong>{ordered ? "Ton package est commandé" : "Réclame ton package Lunii gratuit"}</strong>
                <small>{ordered ? "Voir le détail de ma commande" : "Enregistreur audio pour ta voiture, livraison offerte"}</small>
            </span>
            <ChevronRight size={20} />
        </Link>
    );
}
