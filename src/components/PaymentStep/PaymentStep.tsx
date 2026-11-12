"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Sparkles } from "lucide-react";
import { city, eur } from "@/lib/journeys";
import { POINTS_DISCOUNT, POINTS_USED, PROMO_DISCOUNT, quote } from "@/lib/quote";
import { useApp } from "../AppState/AppState";
import Button from "../Button/Button";
import FlowHeader from "../FlowHeader/FlowHeader";
import FlowPage from "../FlowPage/FlowPage";
import flow from "../FlowPage/FlowPage.module.css";
import { useReservation, useReservationGuard } from "../ReservationProvider/ReservationProvider";
import PaymentMethods from "../PaymentMethods/PaymentMethods";
import PromoField from "../PromoField/PromoField";
import Switch from "../Switch/Switch";
import TotalCard from "../TotalCard/TotalCard";
import styles from "./PaymentStep.module.css";

const pts = (n: number) => `${n.toLocaleString("fr-FR")} pts`;

export default function PaymentStep() {
    useReservationGuard();
    const router = useRouter();
    const { booking, cards, update, addCard } = useReservation();
    const { state } = useApp();
    const [paying, setPaying] = useState(false);

    const balance = state.points;
    const enough = balance >= POINTS_USED;

    useEffect(() => {
        if (!enough && booking.usePoints) update({ usePoints: false });
    }, [enough, booking.usePoints, update]);

    const q = quote({ ...booking, usePoints: booking.usePoints && enough });
    if (!q.aller) return null;

    const pay = () => {
        setPaying(true);
        setTimeout(() => router.push("/reservation/confirmation", { transitionTypes: ["nav-forward"] }), 1200);
    };

    const roundTrip = !!q.retour;
    const summary = `${roundTrip ? "Aller-retour" : "Aller simple"} ${city(q.aller.from)} ${roundTrip ? "⇄" : "→"} ${city(q.aller.to)}${booking.pack ? " · pack histoires inclus" : ""}`;

    return (
        <FlowPage>
            <FlowHeader title="Paiement" backHref="/reservation/recapitulatif" step={4} />

            <TotalCard amount={eur(q.payable)} summary={summary} />

            <h2 className={flow.heading}>Moyen de paiement</h2>
            <PaymentMethods cards={cards} selectedId={booking.method} onSelect={(method) => update({ method })} onAddCard={addCard} />

            <section className={styles.points}>
                <Sparkles size={22} />
                <div className={styles.pointsTexts}>
                    <p className={styles.methodTitle}>Utiliser {pts(POINTS_USED)}</p>
                    <p className={styles.methodHint}>
                        {enough
                            ? `−${eur(POINTS_DISCOUNT)} sur ta commande · ${booking.usePoints ? `il te restera ${pts(balance - POINTS_USED)}` : `tu as ${pts(balance)}`}`
                            : `Il te manque ${pts(POINTS_USED - balance)} pour en profiter`}
                    </p>
                </div>
                {enough && <Switch checked={booking.usePoints} onChange={(usePoints) => update({ usePoints })} label="Utiliser mes points Bluni" />}
            </section>

            <PromoField applied={booking.promo} discount={PROMO_DISCOUNT} onApply={(promo) => update({ promo })} onRemove={() => update({ promo: null })} />

            <Button
                label={paying ? "Paiement en cours…" : q.payable > 0 ? `Payer ${eur(q.payable)}` : "Confirmer la réservation"}
                onClick={pay}
                type={paying ? "deactivated" : "primary"}
            />

            <p className={styles.secure}>
                <Lock size={14} />
                Paiement sécurisé · annulation gratuite jusqu’à 24 h avant
            </p>
        </FlowPage>
    );
}
