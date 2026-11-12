"use client";

import { useState } from "react";
import { sortTrips, tripRowProps, type TripStatus } from "@/lib/trips";
import { useApp } from "../AppState/AppState";
import EmptyState from "../EmptyState/EmptyState";
import FlowHeader from "../FlowHeader/FlowHeader";
import FlowPage from "../FlowPage/FlowPage";
import TripRow from "../TripRow/TripRow";
import styles from "./MyTrips.module.css";

const tabs: { id: TripStatus; label: string; title: string; text: string }[] = [
    { id: "a-venir", label: "À venir", title: "Aucun trajet à venir", text: "Réserve un trajet certifié Bluni ou propose le tien." },
    { id: "termine", label: "Terminés", title: "Aucun trajet terminé", text: "Tes trajets effectués et leurs points apparaîtront ici." },
    { id: "annule", label: "Annulés", title: "Aucun trajet annulé", text: "Les trajets que tu annules apparaîtront ici." },
];

export default function MyTrips() {
    const { state } = useApp();
    const [active, setActive] = useState<TripStatus>("a-venir");
    const tab = tabs.find((t) => t.id === active)!;
    const list = sortTrips(state.trips.filter((t) => t.status === active), active);

    return (
        <FlowPage>
            <FlowHeader title="Mes trajets" backHref="/" />
            <div className={styles.root}>
                <div className={styles.tabs} role="tablist" aria-label="Statut des trajets">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            role="tab"
                            id={`tab-${t.id}`}
                            aria-selected={t.id === active}
                            aria-controls="trips-panel"
                            className={`${styles.tab} ${t.id === active ? styles.active : ""}`}
                            onClick={() => setActive(t.id)}
                        >
                            {t.label}
                            <span className={styles.badge}>{state.trips.filter((x) => x.status === t.id).length}</span>
                        </button>
                    ))}
                </div>
                <div id="trips-panel" role="tabpanel" aria-labelledby={`tab-${active}`}>
                    {list.length ? (
                        <ul>{list.map((t) => <TripRow key={t.id} {...tripRowProps(t)} />)}</ul>
                    ) : (
                        <EmptyState
                            title={tab.title}
                            text={tab.text}
                            action={active === "a-venir" ? { label: "Rechercher un trajet", href: "/" } : undefined}
                        />
                    )}
                </div>
            </div>
        </FlowPage>
    );
}
