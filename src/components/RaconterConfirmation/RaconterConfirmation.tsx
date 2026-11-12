"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { DetailStep } from "@/lib/anecdotes";
import { useApp } from "../AppState/AppState";
import Button from "../Button/Button";
import FlowPage from "../FlowPage/FlowPage";
import flow from "../FlowPage/FlowPage.module.css";
import { useRaconter } from "../RaconterProvider/RaconterProvider";
import StatusSteps from "../StatusSteps/StatusSteps";
import styles from "./RaconterConfirmation.module.css";

const steps: DetailStep[] = [
    { title: "Enregistrée", sub: "À l’instant", state: "done" },
    { title: "Validation des passagers", sub: "À la fin du trajet", state: "current" },
    { title: "En écoute", sub: "Par l’équipe Lunii", state: "todo" },
];

export default function RaconterConfirmation() {
    const router = useRouter();
    const { state } = useApp();
    const { clear, created } = useRaconter();

    // Anecdote envoyée depuis le récapitulatif : on vide le brouillon. Accès direct : retour à Raconter.
    useEffect(() => {
        if (created) clear();
        else router.replace("/raconter");
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!created) return null;

    return (
        <FlowPage>
            <div className={styles.top}>
                <Link href="/raconter" transitionTypes={["nav-back"]} className={styles.close} aria-label="Fermer">
                    <X size={16} />
                </Link>
            </div>

            <div className={styles.illustration}>
                <Image className={styles.halo} src="/images/decors/halo.svg" alt="" width={170} height={170} />
                <Image className={styles.mascot} src="/images/mascottes/france.webp" alt="" width={110} height={135} priority />
            </div>

            <div className={styles.title}>
                <h1 className={styles.heading}>Merci {state.profile.firstName} !</h1>
                <p className={styles.text}>Tes passagers valideront ton anecdote à la fin du trajet. Elle partira ensuite chez Lunii.</p>
            </div>

            <section className={`${flow.box} ${flow.boxYellow} ${styles.steps}`}>
                <StatusSteps variant="detail" steps={steps} />
            </section>

            <div className={styles.actions}>
                <Button label="Retour aux trajets" link="/" transitionTypes={["nav-back"]} type="primary" />
                <Link href={`/raconter/anecdotes/${created.id}`} transitionTypes={["nav-forward"]} className={flow.centerLink}>Voir mon anecdote</Link>
            </div>
        </FlowPage>
    );
}
