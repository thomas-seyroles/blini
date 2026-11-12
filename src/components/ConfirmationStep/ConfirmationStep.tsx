"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, BookOpen, Mic, X } from "lucide-react";
import { dayLine, driverById, placesFor } from "@/lib/journeys";
import { POINTS_USED, quote } from "@/lib/quote";
import { bookedFromJourney } from "@/lib/trips";
import { useApp } from "../AppState/AppState";
import Button from "../Button/Button";
import FlowPage from "../FlowPage/FlowPage";
import flow from "../FlowPage/FlowPage.module.css";
import { useReservation, useReservationGuard } from "../ReservationProvider/ReservationProvider";
import styles from "./ConfirmationStep.module.css";

const dir = "/images/confirmation";

export default function ConfirmationStep() {
    useReservationGuard();
    const { booking } = useReservation();
    const { hydrated, addTrip, spendPoints } = useApp();
    const q = quote(booking);
    const saved = useRef(false);

    // Enregistre les trajets réservés une seule fois, une fois le store restauré
    useEffect(() => {
        if (!hydrated || !q.aller || saved.current) return;
        saved.current = true;
        const stamp = Date.now().toString(36);
        q.journeys.forEach((j) => addTrip(bookedFromJourney(j, placesFor(j, booking.passengers), stamp)));
        if (booking.usePoints) spendPoints(POINTS_USED);
    });

    if (!q.aller) return null;

    const driver = driverById(q.aller.driverId);
    const next = [
        { icon: Bell, text: `${driver.name} confirme ta place sous 24 h` },
        ...(booking.pack ? [{ icon: BookOpen, text: "Ton pack de 3 histoires est prêt à écouter" }] : []),
        { icon: Mic, text: "Raconte une anecdote en route : +50 pts" },
    ];

    return (
        <FlowPage>
            <div className={styles.top}>
                <Link href="/" transitionTypes={["nav-back"]} className={styles.close} aria-label="Fermer">
                    <X size={16} />
                </Link>
            </div>

            <div className={styles.illustration}>
                <Image className={styles.halo} src={`${dir}/halo.svg`} alt="" width={170} height={170} />
                <Image className={styles.mascot} src="/images/mascotte-casque.png" alt="" width={137} height={150} priority />
                <Image className={`${styles.spark} ${styles.sparkA}`} src={`${dir}/etincelle-jaune-grande.svg`} alt="" width={20} height={20} />
                <Image className={`${styles.spark} ${styles.sparkB}`} src={`${dir}/etincelle-violette-moyenne.svg`} alt="" width={14} height={14} />
                <Image className={`${styles.spark} ${styles.sparkC}`} src={`${dir}/etincelle-jaune-petite.svg`} alt="" width={12} height={12} />
                <Image className={`${styles.spark} ${styles.sparkD}`} src={`${dir}/etincelle-violette-petite.svg`} alt="" width={12} height={12} />
            </div>

            <div className={styles.title}>
                <h1 className={styles.heading}>C’est réservé !</h1>
                <p className={styles.text}>{driver.name} confirme ta place sous 24 h. On te prévient dès que c’est fait.</p>
            </div>

            <ul className={`${flow.box} ${styles.recap}`}>
                {q.journeys.map((j) => (
                    <li key={j.id} className={styles.leg}>
                        <span className={flow.tag}>{j.direction === "aller" ? "Aller" : "Retour"}</span>
                        <p>{dayLine(j)}</p>
                    </li>
                ))}
            </ul>

            <section className={styles.next}>
                <h2 className={styles.nextTitle}>Et maintenant ?</h2>
                <ul className={styles.steps}>
                    {next.map(({ icon: Icon, text }) => (
                        <li key={text} className={styles.step}>
                            <span className={styles.pastille}><Icon size={16} /></span>
                            {text}
                        </li>
                    ))}
                </ul>
            </section>

            <div className={styles.actions}>
                <Button label="Préparer les histoires" link="/histoires" transitionTypes={["nav-forward"]} type="primary" />
                <Link href="/trajets/mes-trajets" transitionTypes={["nav-forward"]} className={flow.centerLink}>Voir mes trajets</Link>
            </div>
        </FlowPage>
    );
}
