"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { dayLine, driverById, eur, placesFor, placesLabel, type Journey } from "@/lib/journeys";
import { PACK_PRICE, SERVICE_FEE, quote } from "@/lib/quote";
import Button from "../Button/Button";
import CheckOption from "../CheckOption/CheckOption";
import FlowHeader from "../FlowHeader/FlowHeader";
import FlowPage from "../FlowPage/FlowPage";
import flow from "../FlowPage/FlowPage.module.css";
import { useReservation, useReservationGuard } from "../ReservationProvider/ReservationProvider";
import Switch from "../Switch/Switch";
import styles from "./RecapStep.module.css";

const commitments = [
    "J’ai lu et j’accepte le règlement Bluni",
    "Je voyage avec un enfant de moins de 12 ans",
];

function Leg({ label, journey, passengers }: { label: string; journey: Journey; passengers: number }) {
    const driver = driverById(journey.driverId);
    const places = placesFor(journey, passengers);
    return (
        <li className={styles.leg}>
            <span className={flow.tag}>{label}</span>
            <div className={styles.legTexts}>
                <p className={styles.legTitle}>{dayLine(journey)}</p>
                <p className={styles.legMeta}>
                    avec {driver.name} · {journey.kind === "standard" ? "standard" : "certifié Bluni"} · {placesLabel(places)}
                </p>
            </div>
            <p className={styles.legPrice}>{eur(journey.price * places)}</p>
        </li>
    );
}

export default function RecapStep() {
    useReservationGuard();
    const { booking, update } = useReservation();
    const [accepted, setAccepted] = useState(commitments.map(() => true));

    const q = quote(booking);
    if (!q.aller) return null;

    const places = q.journeys.map((j) => placesFor(j, booking.passengers));
    const sameCount = places.every((p) => p === places[0]);
    const tripsLabel = sameCount ? `Trajets (${placesLabel(places[0])} × ${places.length})` : "Trajets";

    return (
        <FlowPage>
            <FlowHeader title="Récapitulatif" backHref="/reservation/retour" step={3} />

            <h2 className={flow.heading}>Tes trajets</h2>
            <ul className={`${flow.box} ${styles.legs}`}>
                <Leg label="Aller" journey={q.aller} passengers={booking.passengers} />
                {q.retour ? (
                    <Leg label="Retour" journey={q.retour} passengers={booking.passengers} />
                ) : (
                    <li className={styles.noReturn}>
                        <span className={flow.tag}>Retour</span>
                        <p className={styles.legMeta}>À réserver plus tard</p>
                        <Link href="/reservation/retour" transitionTypes={["nav-back"]} className={flow.link}>Ajouter</Link>
                    </li>
                )}
            </ul>

            <section className={styles.pack}>
                <span className={styles.packIcon}><Sparkles size={18} /></span>
                <div className={styles.legTexts}>
                    <p className={styles.legTitle}>Pack 3 histoires de ta route</p>
                    <p className={styles.legMeta}>+ {eur(PACK_PRICE)} · prêtes avant le départ</p>
                </div>
                <Switch checked={booking.pack} onChange={(pack) => update({ pack })} label="Ajouter le pack 3 histoires" />
            </section>

            <h2 className={flow.heading}>Règlement Bluni</h2>
            <ul className={styles.commitments}>
                {commitments.map((label, i) => (
                    <li key={label}>
                        <CheckOption label={label} checked={accepted[i]} onChange={() => setAccepted(accepted.map((v, j) => (j === i ? !v : v)))} />
                    </li>
                ))}
            </ul>
            <Link href="/reservation/reglement" transitionTypes={["nav-forward"]} className={flow.link}>Lire le règlement complet</Link>

            <section className={`${flow.box} ${flow.boxYellow} ${styles.prices}`}>
                <p className={styles.line}><span>{tripsLabel}</span><strong>{eur(q.trips)}</strong></p>
                {booking.pack && <p className={styles.line}><span>Pack 3 histoires</span><strong>{eur(PACK_PRICE)}</strong></p>}
                <p className={styles.line}><span>Frais de service</span><strong>{eur(SERVICE_FEE)}</strong></p>
                <p className={`${styles.line} ${styles.total}`}><span>Total</span><strong>{eur(q.total)}</strong></p>
            </section>

            <p className={styles.points}>
                <Sparkles size={16} />
                +{q.earned} pts Bluni crédités à la fin du trajet
            </p>

            {accepted[0] ? (
                <Button label="Continuer vers le paiement" link="/reservation/paiement" transitionTypes={["nav-forward"]} type="primary" />
            ) : (
                <>
                    <Button label="Continuer vers le paiement" type="deactivated" />
                    <p className={styles.hint}>Accepte le règlement Bluni pour continuer.</p>
                </>
            )}
        </FlowPage>
    );
}
