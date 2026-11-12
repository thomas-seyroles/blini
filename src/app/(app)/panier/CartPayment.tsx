"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useApp } from "@/components/AppState/AppState";
import Button from "@/components/Button/Button";
import { useCartFlow } from "@/components/CartFlow/CartFlow";
import { isBlocked, resolveCart, storyIdsOf, totals } from "@/components/CartFlow/pricing";
import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import flow from "@/components/FlowPage/FlowPage.module.css";
import OrderSummary from "@/components/OrderSummary/OrderSummary";
import PaymentMethods from "@/components/PaymentMethods/PaymentMethods";
import PromoField from "@/components/PromoField/PromoField";
import TotalCard from "@/components/TotalCard/TotalCard";
import { price } from "@/lib/stories";
import { purchaseStories } from "@/server/actions/stories";
import styles from "./panier.module.css";

export default function CartPayment() {
    const router = useRouter();
    const { state, catalog, hydrated, clearCart } = useApp();
    const { promo, setPromo, cards, addCard, method, setMethod, setPurchase } = useCartFlow();
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");

    const lines = resolveCart(state.cart, [...state.ownedStories, ...state.gifts], catalog);
    const blocked = isBlocked(lines);
    const { discount, payable } = totals(lines, promo);

    useEffect(() => {
        if (hydrated && !paying && (lines.length === 0 || blocked)) router.replace("/panier");
    }, [hydrated, paying, lines.length, blocked, router]);

    if (!hydrated || lines.length === 0 || blocked) return null;

    // Faux paiement : le serveur ajoute les histoires à la bibliothèque, sans transaction bancaire
    const pay = async () => {
        setPaying(true);
        setError("");
        const result = await purchaseStories(state.cart, promo);
        if (!result.ok) {
            setPaying(false);
            setError(result.error ?? "Le paiement n’a pas abouti.");
            return;
        }
        setPurchase({ storyIds: result.storyIds, paid: result.paid });
        clearCart();
        router.push("/panier/confirmation", { transitionTypes: ["nav-forward"] });
    };

    return (
        <FlowPage>
            <FlowHeader title="Paiement" backHref="/panier" />

            <TotalCard amount={price(payable)} summary={`${storyIdsOf(lines).length} histoire${storyIdsOf(lines).length > 1 ? "s" : ""} à écouter sans limite`} />

            <OrderSummary
                items={lines.map((l) => ({ label: l.kind === "story" ? l.story.title : l.pack.title, price: l.price }))}
                discount={promo ? { label: `Code ${promo}`, amount: discount } : null}
                total={payable}
            />

            <h2 className={flow.heading}>Moyen de paiement</h2>
            <PaymentMethods cards={cards} selectedId={method} onSelect={setMethod} onAddCard={addCard} />

            <PromoField applied={promo} discount={discount} onApply={setPromo} onRemove={() => setPromo(null)} />

            <Button label={paying ? "Paiement en cours…" : `Payer ${price(payable)}`} onClick={pay} type={paying ? "deactivated" : "primary"} />

            {error && <p className={flow.error} role="alert">{error}</p>}

            <p className={styles.secure}>
                <Lock size={14} />
                Paiement sécurisé · histoires disponibles tout de suite
            </p>
        </FlowPage>
    );
}
