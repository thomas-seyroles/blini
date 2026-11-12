"use client";

import { nextTrip, sortTrips, tripRowProps } from "@/lib/trips";
import { useApp } from "../AppState/AppState";
import SectionTitle from "../SectionTitle/SectionTitle";
import TripRow from "../TripRow/TripRow";
import styles from "./PreviousTrips.module.css";

const LIMIT = 3;

export default function PreviousTrips() {
    const { state } = useApp();
    const next = nextTrip(state.trips, state.profile.role);
    const others = state.trips.filter((t) => t.id !== next?.id && t.status !== "annule");
    const list = [...sortTrips(others.filter((t) => t.status === "a-venir"), "a-venir"), ...sortTrips(others.filter((t) => t.status === "termine"), "termine")].slice(0, LIMIT);

    return (
        <>
            <SectionTitle title="Mes précédents trajets" link={{ label: "Voir tout →", href: "/trajets/mes-trajets" }} />
            {list.length ? (
                <ul>{list.map((t) => <TripRow key={t.id} {...tripRowProps(t)} />)}</ul>
            ) : (
                <p className={styles.empty}>Tes trajets réservés apparaîtront ici.</p>
            )}
        </>
    )
}
