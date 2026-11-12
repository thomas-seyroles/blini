"use client";

import { eur, placesFor, placesLabel, type Journey } from "@/lib/journeys";
import { passengerCount } from "@/lib/trip";
import { useSearch } from "@/lib/useSearch";
import Button from "../Button/Button";
import { useReservation } from "../ReservationProvider/ReservationProvider";
import styles from "./ReserveBar.module.css";

export default function ReserveBar({ journey }: { journey: Journey }) {
    const { update } = useReservation();
    const { criteria } = useSearch();
    const passengers = passengerCount(criteria.guests);
    const places = placesFor(journey, passengers);

    return (
        <div className={styles.root}>
            <div>
                <p className={styles.total}>{eur(journey.price * places)}</p>
                <p className={styles.places}>pour {placesLabel(places)}</p>
            </div>
            <Button
                label="Choisir ce trajet"
                link="/reservation/retour"
                transitionTypes={["nav-forward"]}
                onClick={() => update({ aller: journey, retour: null, pack: true, useVoucher: true, promo: null, method: "card-4242", passengers })}
                type="primary"
            />
        </div>
    );
}
