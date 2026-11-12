"use client";

import Link from "next/link";
import Cover from "../Cover/Cover";
import SectionTitle from "../SectionTitle/SectionTitle";
import StoryRow from "../StoryRow/StoryRow";
import { useApp } from "../AppState/AppState";
import { nextTrip } from "@/lib/trips";
import styles from "@/app/(app)/histoires/page.module.css";

export default function Boutique() {
    const { state, catalog } = useApp();
    const { packs, regions, storiesOfRegion } = catalog;
    const trip = nextTrip(state.trips, "passager") ?? nextTrip(state.trips, "conducteur");
    const slugs = trip?.journey.regions ?? regions.slice(0, 3).map((r) => r.slug);
    const forTrip = slugs.flatMap((s) => storiesOfRegion(s).slice(0, 2));
    const tripPacks = packs.filter((p) => slugs.includes(p.regionSlug));

    return (
        <>
            <section className={styles.section}>
                <SectionTitle
                    title={trip ? "Pour ton prochain trajet" : "À découvrir"}
                    subtitle={trip ? `${trip.from} – ${trip.to} · histoires des régions traversées` : "Une sélection d’histoires régionales"}
                />
                <ul className={styles.list}>
                    {forTrip.map((s) => <StoryRow key={s.id} kind="story" id={s.id} />)}
                </ul>
            </section>
            <section className={styles.section}>
                <SectionTitle title="Packs région" />
                <ul className={styles.list}>
                    {tripPacks.map((p) => <StoryRow key={p.id} kind="pack" id={p.id} />)}
                </ul>
            </section>
            <section className={styles.section}>
                <SectionTitle title="Toutes les régions" />
                <ul className={styles.regions}>
                    {regions.map((r) => (
                        <li key={r.slug}>
                            <Link href={`/histoires/region/${r.slug}`} transitionTypes={["nav-forward"]} className={styles.regionLink}>
                                <Cover regionSlug={r.slug} className={styles.regionCover} sizes="190px" />
                                {r.name}
                                <span className={styles.count}>{storiesOfRegion(r.slug).length} histoires</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    );
}
