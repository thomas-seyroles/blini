"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { SavedCard } from "../PaymentMethods/PaymentMethods";

export type Purchase = { storyIds: string[]; paid: number };

type CartFlowValue = {
    promo: string | null;
    setPromo: (code: string | null) => void;
    cards: SavedCard[];
    addCard: (card: SavedCard) => void;
    method: string;
    setMethod: (id: string) => void;
    purchase: Purchase | null;
    setPurchase: (p: Purchase) => void;
};

const Context = createContext<CartFlowValue | null>(null);

export function CartFlowProvider({ children }: { children: ReactNode }) {
    const [promo, setPromo] = useState<string | null>(null);
    const [cards, setCards] = useState<SavedCard[]>([{ id: "card-4242", last4: "4242", expiry: "09/28" }]);
    const [method, setMethod] = useState("card-4242");
    const [purchase, setPurchase] = useState<Purchase | null>(null);

    return (
        <Context value={{ promo, setPromo, cards, addCard: (card) => { setCards((c) => [...c, card]); setMethod(card.id); }, method, setMethod, purchase, setPurchase }}>
            {children}
        </Context>
    );
}

export function useCartFlow() {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useCartFlow doit être utilisé dans CartFlowProvider");
    return ctx;
}
