"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { shrinkPhoto, type Anecdote, type DetailStep } from "@/lib/anecdotes";
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
    const { state, addAnecdote } = useApp();
    const { draft, clear, created, setCreated } = useRaconter();
    const started = useRef(false);

    const valid = draft.durationSec >= 3 && !!draft.title.trim() && !!draft.place.trim();

    // Création unique de l'anecdote, puis brouillon vidé
    useEffect(() => {
        if (started.current || created) return;
        if (!valid) {
            router.replace("/raconter");
            return;
        }
        started.current = true;
        (async () => {
            const photoUrl = draft.photo ? await shrinkPhoto(draft.photo) : undefined;
            const anecdote: Anecdote = {
                id: `an-${Date.now().toString(36)}`,
                title: draft.title.trim(),
                place: draft.place.trim(),
                audioSec: draft.durationSec,
                hasPhoto: !!photoUrl,
                photoUrl,
                details: draft.details.trim(),
                status: 0,
                points: photoUrl ? 30 : 20,
                sentAt: "Aujourd’hui",
                validated: false,
                tripLabel: "Trajet en cours",
            };
            addAnecdote(anecdote);
            setCreated({ id: anecdote.id, title: anecdote.title });
            clear();
        })();
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
                <Image className={styles.halo} src="/images/confirmation/halo.svg" alt="" width={170} height={170} />
                <Image className={styles.mascot} src="/images/mascotte-france.png" alt="" width={110} height={135} priority />
            </div>

            <p className={styles.points}>+50 pts</p>

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
