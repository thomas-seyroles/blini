"use client";

import { useRef, useState } from "react";
import { POINTS } from "@/lib/points";
import { validateAnecdotes } from "@/server/actions/anecdotes";
import Link from "next/link";
import { Check, Clock, ShieldCheck, X } from "lucide-react";
import { clock } from "@/lib/anecdotes";
import { useApp } from "../AppState/AppState";
import AudioPlayerMini from "../AudioPlayerMini/AudioPlayerMini";
import Button from "../Button/Button";
import CheckOption from "../CheckOption/CheckOption";
import EmptyState from "../EmptyState/EmptyState";
import FlowPage from "../FlowPage/FlowPage";
import flow from "../FlowPage/FlowPage.module.css";
import styles from "./ValidationFlow.module.css";

// Consentement simulé : chaque passager du trajet est marqué accepté ou refusé à la main
type Consent = "accepted" | "refused" | "pending";

export default function ValidationFlow() {
    const { state } = useApp();
    const pending = state.anecdotes.filter((a) => a.validated === false);
    const [selected, setSelected] = useState<string[] | null>(null);
    const [consents, setConsents] = useState<Record<string, Consent>>({});
    const companions = [...new Map(pending.flatMap((a) => a.companions).map((c) => [c.name, c])).values()];
    const passengers = companions.map((c) => ({ name: c.name, role: c.driver ? " (conducteur)" : "", consent: consents[c.name] ?? (c.driver ? "pending" : "accepted") }));
    const driverName = companions.find((c) => c.driver)?.name;
    const [reminded, setReminded] = useState(false);
    const [sent, setSent] = useState<number | null>(null);
    const sending = useRef(false);

    // Par défaut, tout est coché ; ensuite le choix de l'utilisateur prime
    const checked = selected ?? pending.map((a) => a.id);
    const everyoneAccepted = passengers.every((p) => p.consent === "accepted");
    const refused = passengers.some((p) => p.consent === "refused");
    const canSend = checked.length > 0 && everyoneAccepted;

    const setConsent = (name: string, consent: Consent) => setConsents((c) => ({ ...c, [name]: consent }));

    const send = async () => {
        if (!canSend || sending.current) return;
        sending.current = true;
        const ids = checked.filter((id) => pending.some((a) => a.id === id));
        const { count } = await validateAnecdotes(ids);
        setSent(count);
    };

    if (sent !== null) {
        return (
            <FlowPage>
                <div className={styles.done}>
                    <span className={styles.doneIcon}><Check size={28} strokeWidth={3} /></span>
                    <h1 className={styles.title}>{sent} anecdote{sent > 1 ? "s" : ""} envoyée{sent > 1 ? "s" : ""} !</h1>
                    <p className={styles.text}>+{sent * POINTS.validation} pts ajoutés à ton compte. Les auteurs Lunii vont les écouter.</p>
                    <Button label="Voir mes anecdotes" link="/raconter" transitionTypes={["nav-back"]} type="primary" />
                </div>
            </FlowPage>
        );
    }

    if (pending.length === 0) {
        return (
            <FlowPage>
                <EmptyState title="Rien à valider" text="Tes anecdotes de trajet sont toutes validées. Raconte-nous la prochaine !" action={{ label: "Retour à Raconter", href: "/raconter" }} />
            </FlowPage>
        );
    }

    return (
        <FlowPage>
            <div className={styles.head}>
                <span className={styles.trip}>{pending[0].tripLabel} · terminé</span>
                <Link href="/raconter" transitionTypes={["nav-back"]} className={styles.close} aria-label="Fermer">
                    <X size={16} />
                </Link>
            </div>

            <div className={styles.intro}>
                <h1 className={styles.title}>Trajet terminé ! On valide tes anecdotes ?</h1>
                <p className={styles.text}>Chaque passager valide les enregistrements du trajet avant leur envoi à Lunii.</p>
            </div>

            <section className={`${flow.box} ${styles.list}`}>
                <h2 className={styles.listTitle}>{pending.length} anecdote{pending.length > 1 ? "s" : ""} enregistrée{pending.length > 1 ? "s" : ""}</h2>
                {pending.map((a) => (
                    <div key={a.id} className={styles.item}>
                        <AudioPlayerMini durationSec={a.audioSec} variant="round" size={30} label={`Écouter ${a.title}`} />
                        <div className={styles.itemCheck}>
                            <CheckOption
                                label={a.title}
                                checked={checked.includes(a.id)}
                                onChange={(v) => setSelected(v ? [...checked, a.id] : checked.filter((id) => id !== a.id))}
                            />
                        </div>
                        <span className={styles.duration}>{clock(a.audioSec)}</span>
                    </div>
                ))}
            </section>

            {passengers.length > 0 && (
                <section className={`${flow.box} ${flow.boxYellow} ${styles.passengers}`}>
                    {passengers.map((p) => (
                        <div key={p.name} className={styles.row}>
                            <span className={`${styles.avatar} ${p.role ? styles.avatarYellow : ""}`}>{p.name[0]}</span>
                            <div className={styles.rowTexts}>
                                <p className={styles.name}>{p.name}{p.role}</p>
                                <p className={styles.sub}>
                                    {p.consent === "accepted" && "A validé les enregistrements"}
                                    {p.consent === "refused" && "A refusé les enregistrements"}
                                    {p.consent === "pending" && (reminded && p.role ? "Relance envoyée" : "Notification envoyée à la fin du trajet")}
                                </p>
                                <div className={styles.choices}>
                                    {p.consent !== "accepted" && <button type="button" className={styles.choice} onClick={() => setConsent(p.name, "accepted")}>Marquer comme accepté</button>}
                                    {p.consent !== "refused" && <button type="button" className={`${styles.choice} ${styles.refuse}`} onClick={() => setConsent(p.name, "refused")}>Marquer comme refusé</button>}
                                </div>
                            </div>
                            <span className={`${styles.badge} ${p.consent === "accepted" ? styles.badgeOk : p.consent === "refused" ? styles.badgeKo : styles.badgeWait}`}>
                                {p.consent === "accepted" && <Check size={14} />}
                                {p.consent === "refused" && <X size={14} />}
                                {p.consent === "pending" && <Clock size={14} />}
                                {p.consent === "accepted" ? "Accepté" : p.consent === "refused" ? "Refusé" : "En attente"}
                            </span>
                        </div>
                    ))}
                </section>
            )}

            <section className={styles.rules}>
                <span className={styles.rulesIcon}><ShieldCheck size={16} /></span>
                <div>
                    <h2 className={styles.rulesTitle}>Le règlement Bluni</h2>
                    <ul className={styles.rulesList}>
                        <li>Si un passager refuse, l’anecdote n’est pas envoyée.</li>
                        <li>Pas de voix ni de prénom d’enfant sans l’accord d’un parent.</li>
                    </ul>
                </div>
            </section>

            <div className={styles.actions}>
                <Button label="Envoyer les anecdotes validées" type={canSend ? "primary" : "deactivated"} onClick={send} />
                {!canSend && (
                    <p className={styles.hint} role="status">
                        {refused ? "Un passager a refusé : les anecdotes ne peuvent pas être envoyées." : checked.length === 0 ? "Coche au moins une anecdote." : "Tous les passagers doivent consentir pour envoyer."}
                    </p>
                )}
                {driverName && passengers.some((p) => p.role && p.consent === "pending") && (
                    reminded
                        ? <p className={styles.reminded} role="status"><Check size={16} />Relance envoyée à {driverName}</p>
                        : <button type="button" className={flow.centerLink} onClick={() => setReminded(true)}>Relancer {driverName}</button>
                )}
            </div>
        </FlowPage>
    );
}
