"use client";

import { useMemo, useState } from "react";
import { useCatalog } from "../AppState/AppState";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { applyFilters, availableCount, defaultFilters } from "@/lib/filters";
import { cityName } from "@/lib/journeys";
import { useBack } from "@/lib/navHistory";
import type { Criteria } from "@/lib/search";
import { dayInfo, guestsSummary, shiftIso } from "@/lib/trip";
import { useJourneys } from "@/lib/useJourneys";
import { useSearch } from "@/lib/useSearch";
import Button from "../Button/Button";
import DayTabs from "../DayTabs/DayTabs";
import EmptyState from "../EmptyState/EmptyState";
import FilterSheet from "../FilterSheet/FilterSheet";
import ResultCard from "../ResultCard/ResultCard";
import styles from "./TripResults.module.css";

const DAYS = 7;
const SELECTED = 2;

const listFr = (items: string[]) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`);

function Back() {
    const goBack = useBack("/");
    return (
        <Link href="/" onClick={goBack} className={styles.back} aria-label="Retour">
            <ArrowLeft size={20} />
        </Link>
    );
}

function Results({ criteria }: { criteria: Criteria }) {
    const [offset, setOffset] = useState(SELECTED);
    const [filters, setFilters] = useState(defaultFilters);
    const from = cityName(criteria.from);
    const to = cityName(criteria.to);
    const dates = useMemo(() => Array.from({ length: DAYS }, (_, i) => shiftIso(criteria.aller, i - SELECTED)), [criteria.aller]);
    const date = dates[offset];
    const day = dayInfo(date);

    const { regionName } = useCatalog();
    const { journeys: base, regions: slugs, loading } = useJourneys(from, to, date);
    const list = applyFilters(base, filters);
    const count = availableCount(list);
    const regions = slugs.map(regionName);
    const info = [
        `${day.short} ${day.date}`,
        criteria.retour && `retour ${dayInfo(criteria.retour).short} ${dayInfo(criteria.retour).date}`,
        guestsSummary(criteria.guests, "passager"),
    ].filter(Boolean).join(" · ");

    const stories = (
        <li key="stories">
            <Link href="/histoires" transitionTypes={["nav-forward"]} className={styles.stories}>
                <span className={styles.mascot}>
                    <Image src={`/images/mascottes/resultats.webp`} alt="" width={2480} height={3508} />
                </span>
                <span className={styles.storiesTexts}>
                    <span className={styles.storiesTitle}>{regions.length} histoire{regions.length > 1 ? "s" : ""} sur ta route</span>
                    <span className={styles.storiesText}>{listFr(regions)} à écouter pendant le trajet.</span>
                </span>
                <ChevronRight size={18} />
            </Link>
        </li>
    );

    return (
        <>
            <header className={styles.header}>
                <div className={styles.search}>
                    <Back />
                    <div className={styles.route}>
                        <h1 className={styles.title}>
                            <span>{from}</span>
                            <span className={styles.arrow}>→</span>
                            <span>{to}</span>
                        </h1>
                        <p className={styles.criteria}>{info}</p>
                    </div>
                </div>
                <DayTabs days={dates.map((iso) => ({ weekday: dayInfo(iso).short, date: dayInfo(iso).date }))} initial={offset} onSelect={setOffset} />
            </header>

            <section className={styles.results}>
                <div className={styles.summary}>
                    <p className={styles.count} aria-live="polite">{loading ? "Recherche des trajets…" : `${count} trajet${count > 1 ? "s" : ""} disponible${count > 1 ? "s" : ""}`}</p>
                    <FilterSheet filters={filters} onChange={setFilters} count={count} />
                </div>

                {!loading && base.length === 0 && (
                    <EmptyState
                        title="Aucun trajet ce jour"
                        text={`Aucun trajet ${from} → ${to} le ${day.weekday} ${day.date} Essaie un autre jour dans les onglets, ou modifie ta recherche.`}
                        action={{ label: "Modifier ma recherche", href: "/" }}
                    />
                )}

                {base.length > 0 && list.length === 0 && (
                    <div className={styles.empty}>
                        <EmptyState title="Aucun trajet ne correspond" text="Aucun trajet ne répond à tes filtres pour ce jour." />
                        <Button label="Effacer les filtres" onClick={() => setFilters(defaultFilters)} type="secondary" />
                    </div>
                )}

                {list.length > 0 && (
                    <>
                        {list.some((j) => j.kind === "certifie") && (
                        <div className={styles.legend}>
                            <Image className={styles.legendLogo} src="/images/logos/bluni-simple.webp" alt="" width={23} height={26} />
                            <div>
                                <p className={styles.legendTitle}>Les trajets en violet sont certifiés Bluni</p>
                                <p className={styles.legendText}>Profils vérifiés, règlement accepté, casque Lunii à bord.</p>
                            </div>
                        </div>
                        )}
                        <ul className={styles.list}>
                            {list.slice(0, 3).map((j) => <ResultCard key={j.id} journey={j} href={`/reservation/trajet/${j.id}`} />)}
                            {stories}
                            {list.slice(3).map((j) => <ResultCard key={j.id} journey={j} href={`/reservation/trajet/${j.id}`} />)}
                        </ul>
                    </>
                )}
            </section>
        </>
    );
}

export default function TripResults() {
    const { criteria, hydrated } = useSearch();
    const searched = criteria.from && criteria.to;

    return (
        <main className={styles.page}>
            {hydrated && !searched && (
                <>
                    <header className={styles.header}>
                        <Back />
                    </header>
                    <EmptyState
                        title="Où allez-vous ?"
                        text="Indique un départ et une arrivée pour voir les trajets disponibles."
                        action={{ label: "Rechercher un trajet", href: "/" }}
                    />
                </>
            )}
            {hydrated && searched && <Results key={`${criteria.from}|${criteria.to}|${criteria.aller}`} criteria={criteria} />}
        </main>
    );
}
