"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Calendar, Car, Plus, Users } from "lucide-react";
import { placesLabel } from "@/lib/journeys";
import { dateOf, formatDay, guestsSummary, isoOf } from "@/lib/trip";
import { publishedTrip, tripHref, type BookedTrip } from "@/lib/trips";
import { useSearch } from "@/lib/useSearch";
import { useApp } from "../AppState/AppState";
import Button from "../Button/Button";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import CalendarModule from "../CalendarModule/CalendarModule";
import CriteriaTile from "../CriteriaTile/CriteriaTile";
import PassengersModule from "../PassengersModule/PassengersModule";
import PlaceModule from "../PlaceModule/PlaceModule";
import SearchField from "../SearchField/SearchField";
import styles from "./SearchForm.module.css";

type Field = "from" | "to" | "aller" | "retour" | "passengers";

export default function SearchForm() {
    const router = useRouter();
    const { state, update, addTrip } = useApp();
    const { criteria, setCriteria } = useSearch();
    const role = state.profile.role;
    const { from, to, guests } = criteria;
    const aller = dateOf(criteria.aller);
    const retour = criteria.retour ? dateOf(criteria.retour) : null;
    const [open, setOpen] = useState<Field | null>(null);
    const [published, setPublished] = useState<BookedTrip | null>(null);
    const close = () => setOpen(null);
    const focus = open ?? "aller";
    const missing = !from ? "from" : !to ? "to" : null;

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const submit = (e: MouseEvent<HTMLElement>) => {
        if (missing) {
            e.preventDefault();
            setOpen(missing);
        } else if (role === "conducteur") {
            const trip = publishedTrip(criteria, state.profile.firstName);
            addTrip(trip);
            setPublished(trip);
        }
    };

    return (
        <section id="recherche" className={styles.root}>
            <div className={styles.fields}>
                <svg className={styles.trace} viewBox="0 0 712 162" preserveAspectRatio="none" aria-hidden>
                    <path d="M1 0 V79 H711 V162" />
                </svg>
                <SearchField label="Départ" value={from} placeholder="D’où partez-vous ?" side="start" active={open === "from"} onClick={() => setOpen("from")} />
                <SearchField label="Arrivée" value={to} placeholder="Où allez-vous ?" side="end" active={open === "to"} onClick={() => setOpen("to")} />
                <button
                    type="button"
                    className={styles.swap}
                    disabled={!from && !to}
                    onClick={() => setCriteria({ from: to, to: from })}
                    aria-label="Inverser départ et arrivée"
                >
                    <ArrowUpDown size={18} />
                </button>
                <div className={styles.criteria}>
                    <div className={styles.dates}>
                        <CriteriaTile
                            label="Aller"
                            value={formatDay(aller, true)}
                            icon={Calendar}
                            state="active"
                            onClick={() => setOpen("aller")}
                        />
                        <CriteriaTile
                            label="Retour"
                            value={retour ? formatDay(retour, true) : "+ Ajouter"}
                            icon={retour ? Calendar : Plus}
                            state={focus === "retour" ? "open" : !retour ? "add" : "default"}
                            onClick={() => setOpen("retour")}
                        />
                    </div>
                    <CriteriaTile
                        label={role === "passager" ? "Passagers" : "Places proposées"}
                        value={guestsSummary(guests, role)}
                        icon={Users}
                        state={focus === "passengers" ? "open" : "default"}
                        onClick={() => setOpen("passengers")}
                    />
                </div>
                {open && <button type="button" className={styles.backdrop} onClick={close} aria-label="Fermer" tabIndex={-1} />}
                {open === "from" && (
                    <div className={`${styles.popup} ${styles.popFrom}`}>
                        <PlaceModule title="Où partez-vous ?" value={from} onValidate={(v) => { setCriteria({ from: v }); close(); }} onClose={close} />
                    </div>
                )}
                {open === "to" && (
                    <div className={`${styles.popup} ${styles.popTo}`}>
                        <PlaceModule title="Où allez-vous ?" value={to} onValidate={(v) => { setCriteria({ to: v }); close(); }} onClose={close} />
                    </div>
                )}
                {(open === "aller" || open === "retour") && (
                    <div className={`${styles.popup} ${styles.popDates}`}>
                        <CalendarModule
                            aller={aller}
                            retour={retour}
                            focus={open}
                            onChange={(d) => setCriteria({ aller: isoOf(d.aller), retour: d.retour ? isoOf(d.retour) : null })}
                            onClose={close}
                        />
                    </div>
                )}
                {open === "passengers" && (
                    <div className={`${styles.popup} ${styles.popPassengers}`}>
                        <PassengersModule role={role} guests={guests} onValidate={(g) => { setCriteria({ guests: g }); close(); }} onClose={close} />
                    </div>
                )}
            </div>
            <div className={styles.actions}>
                <Button
                    label={role === "passager" ? "Rechercher" : "Publier le trajet"}
                    link={role === "passager" ? "/trajets/resultats" : undefined}
                    transitionTypes={["nav-forward"]}
                    onClick={submit}
                    type="primary"
                />
                <Button
                    label={role === "passager" ? "Je conduis · Proposer un trajet" : "Je voyage en passager"}
                    icon={role === "passager" ? Car : Users}
                    onClick={() => update((s) => ({ ...s, profile: { ...s.profile, role: role === "passager" ? "conducteur" : "passager" } }))}
                    type="secondary"
                />
            </div>
            <ConfirmDialog
                open={!!published}
                title="Trajet publié !"
                text={published ? `${published.from} → ${published.to} · ${published.day} à ${published.time} · ${placesLabel(published.places ?? 0)}. Les passagers peuvent maintenant te demander une place.` : ""}
                confirmLabel="Voir le trajet"
                cancelLabel="Rester ici"
                onConfirm={() => {
                    if (!published) return;
                    const href = tripHref(published);
                    setPublished(null);
                    router.push(href, { transitionTypes: ["nav-forward"] });
                }}
                onCancel={() => setPublished(null)}
            />
        </section>
    )
}
