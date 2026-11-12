"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useApp } from "@/components/AppState/AppState";
import Button from "@/components/Button/Button";
import { useCartFlow } from "@/components/CartFlow/CartFlow";
import { resolveCart, storyIdsOf, totals } from "@/components/CartFlow/pricing";
import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import flow from "@/components/FlowPage/FlowPage.module.css";
import OrderSummary from "@/components/OrderSummary/OrderSummary";
import PaymentMethods from "@/components/PaymentMethods/PaymentMethods";
import PromoField from "@/components/PromoField/PromoField";
import TotalCard from "@/components/TotalCard/TotalCard";
import { price } from "@/lib/stories";
import styles from "./panier.module.css";

export default function CartPayment() {
    const router = useRouter();
    const { state, hydrated, checkout } = useApp();
    const { promo, setPromo, cards, addCard, method, setMethod, setPurchase } = useCartFlow();
    const [paying, setPaying] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const lines = resolveCart(state.cart, state.ownedStories);
    const blocked = lines.some((l) => l.ownedIds.length > 0);
    const { discount, payable } = totals(lines, promo);

    useEffect(() => {
        if (hydrated && !paying && (lines.length === 0 || blocked)) router.replace("/panier");
    }, [hydrated, paying, lines.length, blocked, router]);

    useEffect(() => () => clearTimeout(timer.current), []);

    if (!hydrated || lines.length === 0 || blocked) return null;

    const pay = () => {
        setPaying(true);
        const storyIds = storyIdsOf(lines);
        timer.current = setTimeout(() => {
            setPurchase({ storyIds, paid: payable });
            checkout();
            router.push("/panier/confirmation", { transitionTypes: ["nav-forward"] });
        }, 1200);
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

            <p className={styles.secure}>
                <Lock size={14} />
                Paiement sécurisé · histoires disponibles tout de suite
            </p>
        </FlowPage>
    );
}
