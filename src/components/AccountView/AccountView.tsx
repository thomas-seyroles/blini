"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, CircleCheck, FileText, Globe, Contrast, Lock, Mic, CircleHelp, ShieldCheck, Users } from "lucide-react";
import { useApp } from "@/components/AppState/AppState";
import Button from "@/components/Button/Button";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import LinkedAccountRow from "@/components/LinkedAccountRow/LinkedAccountRow";
import SectionTitle from "@/components/SectionTitle/SectionTitle";
import SettingRow from "@/components/SettingRow/SettingRow";
import StatTile from "@/components/StatTile/StatTile";
import { APPARENCES, LANGUES, certification, choice, flag, setSetting } from "@/lib/account";
import type { Role } from "@/lib/trip";
import styles from "./AccountView.module.css";

type Dialog = "blablacar" | "lunii" | "logout" | "delete" | null;

const SERVICES = { blablacar: "BlaBlaCar", lunii: "Lunii" } as const;
const ROLES: { id: Role; label: string }[] = [
    { id: "passager", label: "Passager" },
    { id: "conducteur", label: "Conducteur" },
];

export default function AccountView() {
    const { state, update, reset } = useApp();
    const router = useRouter();
    const [dialog, setDialog] = useState<Dialog>(null);
    const [flash, setFlash] = useState("");
    const { profile, linked } = state;
    const cert = certification(state);
    const palier = Math.min(5, 1 + Math.floor(state.points / 500));
    const flashKey = state.settings.flash;

    useEffect(() => {
        if (typeof flashKey !== "string" || !flashKey) return;
        setFlash(flashKey);
        update(setSetting("flash", ""));
    }, [flashKey, update]);

    const setLinked = (id: keyof typeof linked, value: boolean) => {
        update((s) => ({ ...s, linked: { ...s.linked, [id]: value } }));
        setFlash(`${SERVICES[id]} ${value ? "lié" : "délié"}.`);
    };
    const leave = () => {
        reset();
        router.replace("/");
    };

    const checks = [
        { ok: cert.identite, label: "Pièce d’identité vérifiée", href: "/compte/profil" },
        { ok: cert.compteLie, label: "Compte BlaBlaCar ou Lunii lié", href: "#comptes-lies" },
        { ok: cert.reglement, label: "Règlement Bluni accepté", href: "/compte/reglement" },
        {
            ok: cert.experience,
            label: cert.experience ? "Expérience conducteur validée" : `Kit conducteur : encore ${cert.remaining} trajet${cert.remaining > 1 ? "s" : ""} avec de bons avis`,
            href: "/trajets/mes-trajets",
        },
    ];

    const dialogs = {
        blablacar: { title: "Délier BlaBlaCar ?", text: "Tu pourras le lier de nouveau à tout moment.", confirm: "Délier", run: () => setLinked("blablacar", false) },
        lunii: { title: "Délier Lunii ?", text: "Tu pourras le lier de nouveau à tout moment.", confirm: "Délier", run: () => setLinked("lunii", false) },
        logout: { title: "Se déconnecter ?", text: "Ta session sera fermée et les données de cet appareil effacées.", confirm: "Se déconnecter", run: leave },
        delete: { title: "Supprimer ton compte ?", text: "Tes anecdotes, points et trajets seront définitivement supprimés. Cette action est irréversible.", confirm: "Supprimer", run: leave },
    };
    const current = dialog ? dialogs[dialog] : null;

    return (
        <>
            {flash && <p className={styles.flash} role="status">{flash}</p>}

            <section className={styles.profile}>
                <Link href="/compte/profil" transitionTypes={["nav-forward"]} className={styles.card}>
                    <span className={styles.avatar}>{profile.firstName.charAt(0).toUpperCase() || "?"}</span>
                    <span className={styles.identity}>
                        <span className={styles.name}>{profile.firstName} {profile.lastName}</span>
                        <span className={styles.email}>{profile.email}</span>
                        <span className={styles.tags}>
                            <span className={styles.tagFilled}>{profile.role === "conducteur" ? "Conducteur" : "Passager"}</span>
                            {cert.certified && <span className={styles.tagFilled}>Certifié Bluni</span>}
                            <span className={styles.tagOutline}>Conteur · palier {palier}</span>
                        </span>
                    </span>
                    <ChevronRight size={20} />
                </Link>
            </section>

            <section className={styles.section}>
                <SectionTitle title="Mes contributions" link={{ label: "Voir le suivi", href: "/raconter" }} />
                <div className={styles.tiles}>
                    <StatTile value={state.anecdotes.length} label={`anecdote${state.anecdotes.length > 1 ? "s" : ""} envoyée${state.anecdotes.length > 1 ? "s" : ""}`} href="/raconter" />
                    <StatTile value={state.points} label="points gagnés" href="/cadeaux" />
                    <StatTile value={state.trips.length} label={`trajet${state.trips.length > 1 ? "s" : ""} réservé${state.trips.length > 1 ? "s" : ""}`} href="/trajets/mes-trajets" />
                </div>
            </section>

            <section id="comptes-lies" className={styles.sectionTight}>
                <SectionTitle title="Comptes liés" subtitle="Au moins un compte doit rester lié pour utiliser Bluni." />
                <ul>
                    {(Object.keys(SERVICES) as (keyof typeof SERVICES)[]).map((id) => (
                        <LinkedAccountRow
                            key={id}
                            service={SERVICES[id]}
                            linked={linked[id]}
                            status={linked[id] ? `Lié · ${profile.email}` : id === "lunii" ? "Non lié · pour retrouver tes histoires sur ta conteuse" : "Non lié · pour réserver des trajets"}
                            canUnlink={linked.blablacar && linked.lunii}
                            onLink={() => setLinked(id, true)}
                            onUnlink={() => setDialog(id)}
                        />
                    ))}
                </ul>
            </section>

            <section className={styles.section}>
                <SectionTitle title="Certification Bluni" subtitle="Nécessaire pour réserver un trajet certifié Bluni." />
                <ul className={styles.cert}>
                    {checks.map(({ ok, label, href }) => (
                        <li key={label}>
                            {ok ? (
                                <span className={`${styles.check} ${styles.checkDone}`}><CircleCheck size={20} className={styles.checkIcon} />{label}</span>
                            ) : (
                                <Link href={href} transitionTypes={["nav-forward"]} className={styles.check}>
                                    <Lock size={20} />
                                    <span className={styles.checkLabel}>{label}</span>
                                    <ChevronRight size={16} />
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </section>

            <section className={styles.sectionTight}>
                <SettingRow
                    icon={Users}
                    title="Rôle par défaut"
                    subtitle="Préremplit la recherche à l’ouverture"
                    value={
                        <span className={styles.segment} role="group" aria-label="Rôle par défaut">
                            {ROLES.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    aria-pressed={profile.role === r.id}
                                    className={styles.segmentButton}
                                    onClick={() => update((s) => ({ ...s, profile: { ...s.profile, role: r.id } }))}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </span>
                    }
                />
                <h2 className={styles.settingsTitle}>Paramètres</h2>
                <SettingRow
                    icon={Bell}
                    title="Notifications"
                    subtitle="Suivi de tes anecdotes et rappels de trajet"
                    href="/compte/notifications"
                    toggle={{ checked: flag(state, "notifications"), onChange: (v) => update(setSetting("notifications", v)) }}
                />
                <SettingRow
                    icon={Mic}
                    title="Consentement à l’enregistrement"
                    subtitle="Demander l’accord des passagers avant chaque enregistrement"
                    toggle={{ checked: flag(state, "consentement"), onChange: (v) => update(setSetting("consentement", v)) }}
                />
                <SettingRow icon={ShieldCheck} title="Confidentialité et données" subtitle="Enregistrements, droits cédés, données personnelles" href="/compte/confidentialite" />
                <SettingRow icon={Contrast} title="Apparence" href="/compte/apparence" value={<span className={styles.value}>{APPARENCES[choice(state, "apparence", "auto")]}</span>} />
                <SettingRow icon={Globe} title="Langue" href="/compte/langue" value={<span className={styles.value}>{LANGUES[choice(state, "langue", "fr")]}</span>} />
                <SettingRow icon={FileText} title="Règlement Bluni" subtitle="Consentement, cession des droits, protection des mineurs" href="/compte/reglement" />
                <SettingRow icon={CircleHelp} title="Aide et contact" href="/compte/aide" />
            </section>

            <section className={styles.footer}>
                <Button type="accent" label="Se déconnecter" onClick={() => setDialog("logout")} />
                <button type="button" className={styles.delete} onClick={() => setDialog("delete")}>Supprimer mon compte</button>
                <p className={styles.version}>Bluni v1.0 · BlaBlaCar × Lunii</p>
            </section>

            <ConfirmDialog
                open={dialog !== null}
                title={current?.title ?? ""}
                text={current?.text ?? ""}
                confirmLabel={current?.confirm ?? ""}
                danger={dialog === "delete"}
                onCancel={() => setDialog(null)}
                onConfirm={() => {
                    current?.run();
                    setDialog(null);
                }}
            />
        </>
    );
}
