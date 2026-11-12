"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { minSec, shrinkPhoto } from "@/lib/anecdotes";
import { POINTS } from "@/lib/points";
import { createAnecdote } from "@/server/actions/anecdotes";
import AudioPlayerMini from "../AudioPlayerMini/AudioPlayerMini";
import Button from "../Button/Button";
import CheckOption from "../CheckOption/CheckOption";
import FlowHeader from "../FlowHeader/FlowHeader";
import FlowPage from "../FlowPage/FlowPage";
import flow from "../FlowPage/FlowPage.module.css";
import { useObjectUrl, useRaconterGuard } from "../RaconterProvider/RaconterProvider";
import styles from "./RaconterRecapStep.module.css";

const commitments = [
    "J’accepte que Lunii réécrive et publie mon récit",
    "Aucun enfant n’est reconnaissable dans l’enregistrement",
    "Mes passagers sont prévenus de l’enregistrement",
];

export default function RaconterRecapStep() {
    const ctx = useRaconterGuard("recapitulatif");
    const router = useRouter();
    const [checked, setChecked] = useState([false, false, false]);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const photo = useObjectUrl(ctx?.draft.photo ?? null);
    const audio = useObjectUrl(ctx?.draft.audio ?? null);
    if (!ctx) return null;

    const { draft, setCreated } = ctx;
    const ready = checked.every(Boolean) && !sending;

    const send = async () => {
        if (!ready) return;
        setSending(true);
        setError("");
        const form = new FormData();
        form.set("title", draft.title);
        form.set("place", draft.place);
        form.set("details", draft.details);
        form.set("audioSec", String(draft.durationSec));
        if (draft.audio) form.set("audio", draft.audio, "anecdote");
        const photo = draft.photo && (await shrinkPhoto(draft.photo));
        if (photo) form.set("photo", photo, "photo.jpg");
        const result = await createAnecdote(form);
        if (!result.ok) {
            setSending(false);
            setError(result.error ?? "L’envoi n’a pas abouti.");
            return;
        }
        setCreated({ id: result.id, title: result.title });
        router.push("/raconter/confirmation", { transitionTypes: ["nav-forward"] });
    };

    return (
        <FlowPage>
            <FlowHeader title="Raconter" backHref="/raconter/contexte" step={3} steps={4} />
            <h2 className={styles.heading}>On vérifie avant d’envoyer ?</h2>

            <section className={`${flow.box} ${styles.summary}`}>
                <div className={styles.photo}>
                    {photo && <Image src={photo} alt="" fill unoptimized sizes="72px" />}
                </div>
                <div className={styles.texts}>
                    <p className={styles.title}>{draft.title}</p>
                    <p className={styles.info}><MapPin size={14} color="var(--violet)" />{draft.place}</p>
                    <p className={styles.info}>Audio {minSec(draft.durationSec)} · validation en fin de trajet</p>
                </div>
                <AudioPlayerMini durationSec={draft.durationSec} src={audio} variant="round" size={36} label="Réécouter" />
            </section>

            <fieldset className={styles.commitments}>
                <legend className={styles.legend}>Tes engagements</legend>
                {commitments.map((label, i) => (
                    <CheckOption key={label} label={label} checked={checked[i]} onChange={(v) => setChecked((c) => c.map((x, j) => (j === i ? v : x)))} />
                ))}
            </fieldset>

            <div className={styles.points}>
                <Image src="/images/icones/points.svg" alt="" width={22} height={22} />
                <div>
                    <p className={styles.pointsTitle}>+{POINTS.validation} pts après la validation des passagers</p>
                    <p className={styles.pointsText}>+{POINTS.retenue} pts si l’équipe Lunii utilise ton récit</p>
                </div>
            </div>

            <div className={styles.actions}>
                <Button label={sending ? "Envoi en cours…" : "Envoyer mon anecdote"} type={ready ? "primary" : "deactivated"} onClick={send} />
                {error && <p className={flow.error} role="alert">{error}</p>}
                {!checked.every(Boolean) && <p className={styles.hint}>Coche les trois engagements pour envoyer.</p>}
                <Link href="/raconter/contexte" transitionTypes={["nav-back"]} className={flow.centerLink}>Modifier</Link>
            </div>
        </FlowPage>
    );
}
