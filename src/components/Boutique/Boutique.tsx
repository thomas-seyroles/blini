"use client";

import Link from "next/link";
import Cover from "../Cover/Cover";
import SectionTitle from "../SectionTitle/SectionTitle";
import StoryRow from "../StoryRow/StoryRow";
import { useApp } from "../AppState/AppState";
import { packs, regions, regionsOfRoute, storiesOfRegion } from "@/lib/stories";
import styles from "@/app/histoires/page.module.css";

export default function Boutique() {
    const { state } = useApp();
    const trip = state.trips.find((t) => t.status === "a-venir");
    const from = trip?.from ?? "Paris";
    const to = trip?.to ?? "Lyon";
    const slugs = regionsOfRoute(from, to);
    const forTrip = slugs.flatMap((s) => storiesOfRegion(s).slice(0, 2));
    const tripPacks = packs.filter((p) => slugs.includes(p.regionSlug));

    return (
        <>
            <section className={styles.section}>
                <SectionTitle title="Pour ton prochain trajet" subtitle={`${from} – ${to} · histoires des régions traversées`} />
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
