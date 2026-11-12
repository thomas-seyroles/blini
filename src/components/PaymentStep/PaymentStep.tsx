"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Sparkles } from "lucide-react";
import { city, eur } from "@/lib/journeys";
import { PROMO_DISCOUNT, VOUCHER_DISCOUNT, VOUCHER_ITEM_ID, canUseVoucher, quote } from "@/lib/quote";
import { bookJourneys } from "@/server/actions/trips";
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

export default function PaymentStep() {
    useReservationGuard();
    const router = useRouter();
    const { booking, cards, update, addCard } = useReservation();
    const { state, catalog } = useApp();
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");

    const owned = state.inventory.includes(VOUCHER_ITEM_ID);
    const usable = owned && canUseVoucher(booking.aller);

    useEffect(() => {
        if (!usable && booking.useVoucher) update({ useVoucher: false });
    }, [usable, booking.useVoucher, update]);

    const q = quote({ ...booking, useVoucher: booking.useVoucher && usable });
    if (!q.aller) return null;

    // Faux paiement : le serveur enregistre les demandes de place, sans transaction bancaire
    const pay = async () => {
        setPaying(true);
        setError("");
        const result = await bookJourneys({
            allerId: q.aller!.id,
            retourId: q.retour?.id ?? null,
            passengers: booking.passengers,
            pack: booking.pack,
            useVoucher: booking.useVoucher && usable,
            promo: booking.promo,
        });
        if (!result.ok) {
            setPaying(false);
            setError(result.error ?? "La réservation n’a pas abouti.");
            return;
        }
        router.push("/reservation/confirmation", { transitionTypes: ["nav-forward"] });
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
                    <p className={styles.methodTitle}>Remise de {eur(VOUCHER_DISCOUNT)}</p>
                    <p className={styles.methodHint}>
                        {usable
                            ? `Un bon de ton compte, −${eur(VOUCHER_DISCOUNT)} sur ta commande`
                            : owned
                              ? "Valable uniquement sur un trajet certifié Bluni"
                              : `Échange ${catalog.itemById(VOUCHER_ITEM_ID)?.cost ?? ""} points contre ce bon dans Cadeaux`}
                    </p>
                </div>
                {usable && <Switch checked={booking.useVoucher} onChange={(useVoucher) => update({ useVoucher })} label="Utiliser ma remise de 5 €" />}
            </section>

            <PromoField applied={booking.promo} discount={PROMO_DISCOUNT} onApply={(promo) => update({ promo })} onRemove={() => update({ promo: null })} />

            <Button
                label={paying ? "Paiement en cours…" : q.payable > 0 ? `Payer ${eur(q.payable)}` : "Confirmer la réservation"}
                onClick={pay}
                type={paying ? "deactivated" : "primary"}
            />

            {error && <p className={flow.error} role="alert">{error}</p>}

            <p className={styles.secure}>
                <Lock size={14} />
                Paiement sécurisé · annulation gratuite jusqu’à 24 h avant
            </p>
        </FlowPage>
    );
}
