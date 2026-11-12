"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PASSENGERS } from "@/lib/journeys";
import type { Booking } from "@/lib/quote";

export type Card = { id: string; last4: string; expiry: string };

type Reservation = {
    booking: Booking;
    cards: Card[];
    update: (patch: Partial<Booking>) => void;
    addCard: (card: Card) => void;
}

const initial: Booking = { allerId: null, retourId: null, pack: true, usePoints: true, promo: null, method: "card-4242", passengers: PASSENGERS };
const initialCards: Card[] = [{ id: "card-4242", last4: "4242", expiry: "09/28" }];

const Context = createContext<Reservation | null>(null);

export function ReservationProvider({ children }: { children: ReactNode }) {
    const [booking, setBooking] = useState(initial);
    const [cards, setCards] = useState(initialCards);

    const value: Reservation = {
        booking,
        cards,
        update: (patch) => setBooking((b) => ({ ...b, ...patch })),
        addCard: (card) => {
            setCards((c) => [...c, card]);
            setBooking((b) => ({ ...b, method: card.id }));
        },
    };

    return <Context value={value}>{children}</Context>;
}

export function useReservation() {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useReservation doit être utilisé dans ReservationProvider");
    return ctx;
}

// Sans trajet aller choisi (rechargement, accès direct), retour à la recherche
export function useReservationGuard() {
    const ctx = useReservation();
    const router = useRouter();
    const missing = !ctx.booking.allerId;

    useEffect(() => {
        if (missing) router.replace("/trajets/resultats");
    }, [missing, router]);

    return missing ? null : ctx;
}
