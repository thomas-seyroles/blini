"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { city, driverById, eur, journeyById, journeysOn } from "@/lib/journeys";
import { dateOf, dayInfo, shiftIso } from "@/lib/trip";
import { useSearch } from "@/lib/useSearch";
import DayTabs from "../DayTabs/DayTabs";
import FlowHeader from "../FlowHeader/FlowHeader";
import EmptyState from "../EmptyState/EmptyState";
import FlowPage from "../FlowPage/FlowPage";
import flow from "../FlowPage/FlowPage.module.css";
import { useReservation, useReservationGuard } from "../ReservationProvider/ReservationProvider";
import ResultCard from "../ResultCard/ResultCard";
import styles from "./ReturnPicker.module.css";

const DAYS = 5;

export default function ReturnPicker() {
    useReservationGuard();
    const { booking, update } = useReservation();
    const { criteria } = useSearch();
    const aller = booking.allerId ? journeyById(booking.allerId) : null;
    const [index, setIndex] = useState(() => {
        if (!aller || !criteria.retour) return 1;
        const gap = Math.round((dateOf(criteria.retour).getTime() - dateOf(aller.date).getTime()) / 86400000);
        return Math.min(DAYS - 1, Math.max(0, gap));
    });
    if (!aller) return null;

    const dates = Array.from({ length: DAYS }, (_, i) => shiftIso(aller.date, i));
    const tabs = dates.map((iso) => ({ weekday: dayInfo(iso).short, date: dayInfo(iso).date }));
    const day = dayInfo(dates[index]);
    const list = journeysOn(city(aller.to), city(aller.from), dates[index], "retour");

    return (
        <FlowPage>
            <FlowHeader title="Ton trajet retour" backHref={`/reservation/trajet/${aller.id}`} step={2} />

            <section className={styles.chosen}>
                <span className={styles.check}><Check size={16} /></span>
                <div className={styles.texts}>
                    <p className={styles.title}>Aller · {dayInfo(aller.date).short.toLowerCase()} {dayInfo(aller.date).date}</p>
                    <p className={styles.detail}>
                        {city(aller.from)} {aller.departTime} → {city(aller.to)} {aller.arrivalTime} · avec {driverById(aller.driverId).name} · {eur(aller.price)}
                    </p>
                </div>
                <Link href="/trajets/resultats" transitionTypes={["nav-back"]} className={styles.edit}>Modifier</Link>
            </section>

            <h2 className={styles.route}>
                <span>{city(aller.to)}</span>
                <span className={styles.arrow}>→</span>
                <span>{city(aller.from)}</span>
            </h2>

            <DayTabs days={tabs} initial={index} onSelect={setIndex} />

            {list.length === 0 ? (
                <EmptyState title="Aucun trajet ce jour" text="Essaie un autre jour dans les onglets, ou réserve ton retour plus tard." />
            ) : (
                <>
                    <p className={styles.count}>
                        {list.length} trajet{list.length > 1 ? "s" : ""} {day.weekday} · retour certifiés en violet
                    </p>
                    <ul className={styles.list}>
                        {list.map((j) => (
                            <ResultCard key={j.id} journey={j} href="/reservation/recapitulatif" onChoose={() => update({ retourId: j.id })} />
                        ))}
                    </ul>
                </>
            )}

            <Link
                href="/reservation/recapitulatif"
                transitionTypes={["nav-forward"]}
                onClick={() => update({ retourId: null })}
                className={flow.centerLink}
            >
                Je réserverai mon retour plus tard
            </Link>
        </FlowPage>
    );
}
