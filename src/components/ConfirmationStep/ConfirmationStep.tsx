"use client";

import Image from "next/image";
import Sparkle from "@/components/Sparkle/Sparkle";
import Link from "next/link";
import { Bell, BookOpen, Mic, X } from "lucide-react";
import { dayLine } from "@/lib/journeys";
import { quote } from "@/lib/quote";
import Button from "../Button/Button";
import FlowPage from "../FlowPage/FlowPage";
import flow from "../FlowPage/FlowPage.module.css";
import { useReservation, useReservationGuard } from "../ReservationProvider/ReservationProvider";
import styles from "./ConfirmationStep.module.css";

const dir = "/images/decors";

export default function ConfirmationStep() {
    useReservationGuard();
    const { booking } = useReservation();
    const q = quote(booking);
    if (!q.aller) return null;

    const { driver } = q.aller;
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
                <Image className={styles.mascot} src="/images/mascottes/casque.webp" alt="" width={137} height={150} priority />
                <Sparkle className={`${styles.spark} ${styles.sparkA}`} size={20} />
                <Sparkle className={`${styles.spark} ${styles.sparkB}`} size={14} violet />
                <Sparkle className={`${styles.spark} ${styles.sparkC}`} size={12} />
                <Sparkle className={`${styles.spark} ${styles.sparkD}`} size={12} violet />
            </div>

            <div className={styles.title}>
                <h1 className={styles.heading}>C’est réservé !</h1>
                <p className={styles.text}>{driver.name} confirme ta place sous 24 h. On te prévient dès que c’est fait.</p>
            </div>

            <ul className={`${flow.box} ${styles.recap}`}>
                {q.journeys.map((j) => (
                    <li key={j.id} className={styles.leg}>
                        <span className={flow.tag}>{j === q.aller ? "Aller" : "Retour"}</span>
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
