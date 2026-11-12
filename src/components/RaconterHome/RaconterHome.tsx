"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useApp } from "../AppState/AppState";
import AnecdoteCard from "../AnecdoteCard/AnecdoteCard";
import PackageCta from "../PackageCta/PackageCta";
import EmptyState from "../EmptyState/EmptyState";
import TabHeader from "../TabHeader/TabHeader";
import styles from "./RaconterHome.module.css";

export default function RaconterHome() {
    const { state } = useApp();
    const [hint, setHint] = useState(true);

    useEffect(() => {
        const hide = () => setHint(false);
        const timer = setTimeout(hide, 6000);
        window.addEventListener("scroll", hide, { once: true });
        return () => {
            clearTimeout(timer);
            window.removeEventListener("scroll", hide);
        };
    }, []);
    const list = state.anecdotes;
    const waiting = list.filter((a) => a.validated === false).length;
    const total = list.reduce((sum, a) => sum + a.points, 0);

    return (
        <main className={styles.page}>
            <div className={styles.header}>
                <TabHeader title="racontes nous tout !" />
            </div>
            <Image className={styles.mascot} src="/images/mascottes/livres.webp" alt="" width={135} height={135} priority />

            {waiting > 0 && (
                <Link href="/raconter/validation" transitionTypes={["nav-forward"]} className={styles.banner}>
                    <span>
                        <strong>Trajet terminé ? Valide tes anecdotes</strong>
                        <small>{waiting} anecdote{waiting > 1 ? "s" : ""} en attente de validation</small>
                    </span>
                    <ChevronRight size={20} />
                </Link>
            )}

            <PackageCta variant="banner" />

            <section className={styles.list}>
                <div className={styles.titleRow}>
                    <h2 className={styles.title}>Mes anecdotes</h2>
                    <span className={styles.total}>{total} pts</span>
                </div>
                {list.length === 0 ? (
                    <EmptyState title="Aucune anecdote pour l’instant" text="Appuie sur le micro pour raconter ta première anecdote pendant un trajet." />
                ) : (
                    list.map((a) => <AnecdoteCard key={a.id} anecdote={a} />)
                )}
            </section>

            {hint && <p className={styles.tooltip}>Appuie une fois pour t’enregistrer</p>}
        </main>
    );
}
