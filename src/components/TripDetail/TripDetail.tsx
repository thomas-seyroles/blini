"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Headphones, Star } from "lucide-react";
import { addMinutes, distanceKm, durationLabel, estimatePrice, journeyById, placesLabel, travelMinutes, eur } from "@/lib/journeys";
import { dayInfo } from "@/lib/trip";
import { driverByName, seatsFree, tripDate, tripRole, type BookedTrip } from "@/lib/trips";
import { pdpAt } from "@/lib/pdp";
import { useApp } from "../AppState/AppState";
import Button from "../Button/Button";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import EmptyState from "../EmptyState/EmptyState";
import FlowHeader from "../FlowHeader/FlowHeader";
import FlowPage from "../FlowPage/FlowPage";
import flow from "../FlowPage/FlowPage.module.css";
import ItineraryCard from "../ItineraryCard/ItineraryCard";
import styles from "./TripDetail.module.css";

const statusLabel = { "a-venir": "À venir", termine: "Terminé", annule: "Annulé" };

function Shell({ children }: { children?: ReactNode }) {
    return (
        <FlowPage>
            <FlowHeader title="Détail du trajet" backHref="/trajets/mes-trajets" />
            {children && <div className={styles.root}>{children}</div>}
        </FlowPage>
    );
}

function Driver({ trip }: { trip: BookedTrip }) {
    const driver = driverByName(trip.driver);
    return (
        <>
            <h2 className={flow.heading}>{driver?.female ? "Ta conductrice" : "Ton conducteur"}</h2>
            <section className={`${flow.box} ${flow.boxYellow} ${styles.driver}`}>
                <Image className={styles.photo} src={driver?.photo ?? pdpAt(0)} alt="" width={52} height={52} />
                <div className={styles.driverTexts}>
                    <p className={styles.name}>{trip.driver}</p>
                    {driver && (
                        <p className={styles.meta}>
                            <Star size={13} /> {driver.rating} · {driver.reviews} avis · {driver.car} {driver.color}
                        </p>
                    )}
                </div>
                <Headphones size={18} aria-label="Casque Lunii à bord" />
            </section>
        </>
    );
}

function Passengers({ trip, onChange }: { trip: BookedTrip; onChange: (patch: Partial<BookedTrip>) => void }) {
    const passagers = trip.passagers ?? [];
    const demandes = trip.demandes ?? [];
    const free = seatsFree(trip);
    const upcoming = trip.status === "a-venir";

    return (
        <>
            <h2 className={flow.heading}>Passagers ({passagers.length})</h2>
            {passagers.length ? (
                <ul className={styles.people}>
                    {passagers.map((p) => (
                        <li key={p.name} className={styles.person}>
                            <span className={styles.avatar}>{p.name[0]}</span>
                            <span className={styles.personName}>{p.name}</span>
                            <span className={styles.meta}>{placesLabel(p.places)}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.meta}>Aucun passager pour l’instant.</p>
            )}

            {upcoming && demandes.length > 0 && (
                <>
                    <h2 className={flow.heading}>Demandes de réservation ({demandes.length})</h2>
                    <ul className={styles.people}>
                        {demandes.map((d) => {
                            const fits = d.places <= free;
                            return (
                                <li key={d.id} className={`${flow.box} ${styles.request}`}>
                                    <span className={styles.avatar}>{d.name[0]}</span>
                                    <span className={styles.requestTexts}>
                                        <span className={styles.personName}>{d.name}</span>
                                        <span className={styles.meta}>{fits ? `demande ${placesLabel(d.places)}` : `demande ${placesLabel(d.places)} · plus assez de places`}</span>
                                    </span>
                                    <button
                                        type="button"
                                        className={styles.refuse}
                                        onClick={() => onChange({ demandes: demandes.filter((x) => x.id !== d.id) })}
                                    >
                                        Refuser
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.accept}
                                        disabled={!fits}
                                        onClick={() => onChange({
                                            passagers: [...passagers, { name: d.name, places: d.places }],
                                            demandes: demandes.filter((x) => x.id !== d.id),
                                        })}
                                    >
                                        Accepter
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
        </>
    );
}

export default function TripDetail({ id }: { id: string }) {
    const { state, hydrated, updateTrip } = useApp();
    const [confirming, setConfirming] = useState(false);
    const trip = state.trips.find((t) => t.id === id);

    if (!hydrated) return <Shell />;
    if (!trip) {
        return (
            <Shell>
                <EmptyState
                    title="Trajet introuvable"
                    text="Ce trajet n’existe pas ou a été supprimé de ton compte."
                    action={{ label: "Retour à mes trajets", href: "/trajets/mes-trajets" }}
                />
            </Shell>
        );
    }

    const driver = tripRole(trip) === "conducteur";
    const journey = trip.journeyId ? journeyById(trip.journeyId) : undefined;
    const km = journey?.km ?? distanceKm(trip.from, trip.to);
    const minutes = travelMinutes(km);
    const places = trip.places ?? 2;
    const price = trip.price ?? estimatePrice(km) * places;
    const cancelled = trip.status === "annule";

    const cancel = () => {
        updateTrip(trip.id, { status: "annule" });
        setConfirming(false);
    };

    return (
        <Shell>
            <div className={styles.tags}>
                <span className={`${flow.tag} ${cancelled ? styles.tagCancelled : ""}`}>{statusLabel[trip.status]}</span>
                <span className={flow.tag}>{driver ? "Conducteur" : "Passager"}</span>
            </div>

            {cancelled && (
                <p className={styles.notice} role="status">
                    {driver
                        ? "Trajet annulé. Les passagers ont été prévenus."
                        : "Trajet annulé sans frais. Ta réservation est supprimée et ta place est libérée."}
                </p>
            )}

            <ItineraryCard
                day={dayInfo(tripDate(trip)).long}
                departTime={trip.time}
                arrivalTime={trip.arrivalTime ?? journey?.arrivalTime ?? addMinutes(trip.time, minutes)}
                from={journey?.from ?? trip.from}
                to={journey?.to ?? trip.to}
                fromAddress={journey?.fromAddress}
                toAddress={journey?.toAddress}
                footer={`${journey?.duration ?? durationLabel(minutes)} de trajet · ${km} km`}
                tone={journey?.kind === "standard" ? "yellow" : "violet"}
            />

            {!driver && <Driver trip={trip} />}
            {driver && <Passengers trip={trip} onChange={(patch) => updateTrip(trip.id, patch)} />}

            <ul className={`${flow.box} ${flow.boxYellow} ${styles.facts}`}>
                <li><span>{driver ? "Places proposées" : "Places réservées"}</span><strong>{placesLabel(places)}</strong></li>
                <li><span>{driver ? "Prix par place" : "Prix"}</span><strong>{eur(price)}</strong></li>
                <li><span>Points Bluni</span><strong>+{trip.points} pts</strong></li>
            </ul>

            {!cancelled && (
                <div className={styles.actions}>
                    {trip.status === "a-venir" && (
                        <>
                            <Button label={driver ? "Préparer les histoires du trajet" : "Préparer les histoires"} link="/histoires" transitionTypes={["nav-forward"]} type="primary" />
                            <Button label="Annuler le trajet" onClick={() => setConfirming(true)} type="secondary" />
                            <p className={styles.hint}>Annulation gratuite jusqu’à 24 h avant le départ.</p>
                        </>
                    )}
                    {trip.status === "termine" && (
                        <>
                            <Button label="Valider mes anecdotes" link="/raconter/validation" transitionTypes={["nav-forward"]} type="primary" />
                            <Button label="Raconter une anecdote" link="/raconter" transitionTypes={["nav-forward"]} type="secondary" />
                        </>
                    )}
                </div>
            )}
            {cancelled && <Button label="Rechercher un autre trajet" link="/" transitionTypes={["nav-back"]} type="primary" />}

            <ConfirmDialog
                open={confirming}
                title="Annuler ce trajet ?"
                text={`${trip.from} → ${trip.to}, ${trip.day} à ${trip.time}. Annulation gratuite jusqu’à 24 h avant le départ.${driver ? " Les passagers seront prévenus." : ""}`}
                confirmLabel="Annuler le trajet"
                cancelLabel="Garder le trajet"
                danger
                onConfirm={cancel}
                onCancel={() => setConfirming(false)}
            />
        </Shell>
    );
}
