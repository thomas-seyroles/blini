"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { seedAnecdotes, type Anecdote } from "@/lib/anecdotes";
import { packById } from "@/lib/stories";
import { seedTrips, type BookedTrip } from "@/lib/trips";
import type { Role } from "@/lib/trip";

export type CartLine = { kind: "story" | "pack"; id: string };

export type AppState = {
    profile: { firstName: string; lastName: string; email: string; role: Role };
    linked: { blablacar: boolean; lunii: boolean };
    settings: Record<string, boolean | string>;
    points: number;
    cart: CartLine[];
    ownedStories: string[];
    gifts: string[];
    inventory: string[];
    anecdotes: Anecdote[];
    trips: BookedTrip[];
    nowPlaying: string | null;
};

export const initialState: AppState = {
    profile: { firstName: "Théo", lastName: "Martin", email: "theo.martin@mail.fr", role: "passager" },
    linked: { blablacar: true, lunii: false },
    settings: {},
    points: 1240,
    cart: [],
    ownedStories: ["ile-de-france-1"],
    gifts: ["bretagne-1", "alsace-2", "occitanie-1"],
    inventory: [],
    anecdotes: seedAnecdotes,
    trips: seedTrips,
    nowPlaying: "ile-de-france-1",
};

type Actions = {
    update: (fn: (s: AppState) => AppState) => void;
    addToCart: (line: CartLine) => void;
    removeFromCart: (line: CartLine) => void;
    clearCart: () => void;
    checkout: () => void;
    earnPoints: (n: number) => void;
    spendPoints: (n: number) => boolean;
    addAnecdote: (a: Anecdote) => void;
    updateAnecdote: (id: string, patch: Partial<Anecdote>) => void;
    deleteAnecdote: (id: string) => void;
    addTrip: (t: BookedTrip) => void;
    updateTrip: (id: string, patch: Partial<BookedTrip>) => void;
    removeTrip: (id: string) => void;
    reset: () => void;
};

type App = Actions & { state: AppState; hydrated: boolean };

const KEY = "bluni-state-v1";
const Context = createContext<App | null>(null);

const same = (a: CartLine, b: CartLine) => a.kind === b.kind && a.id === b.id;

export function AppStateProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState(initialState);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) setState({ ...initialState, ...JSON.parse(raw) });
        } catch {}
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem(KEY, JSON.stringify(state));
        } catch {}
    }, [state, hydrated]);

    const update = (fn: (s: AppState) => AppState) => setState(fn);

    const actions: Actions = {
        update,
        addToCart: (line) => update((s) => (s.cart.some((l) => same(l, line)) ? s : { ...s, cart: [...s.cart, line] })),
        removeFromCart: (line) => update((s) => ({ ...s, cart: s.cart.filter((l) => !same(l, line)) })),
        clearCart: () => update((s) => ({ ...s, cart: [] })),
        checkout: () =>
            update((s) => {
                const ids = s.cart.flatMap((l) => (l.kind === "pack" ? packById(l.id)?.storyIds ?? [] : [l.id]));
                return { ...s, cart: [], ownedStories: [...new Set([...s.ownedStories, ...ids])] };
            }),
        earnPoints: (n) => update((s) => ({ ...s, points: s.points + n })),
        spendPoints: (n) => {
            if (state.points < n) return false;
            update((s) => ({ ...s, points: s.points - n }));
            return true;
        },
        addAnecdote: (a) => update((s) => ({ ...s, anecdotes: [a, ...s.anecdotes] })),
        updateAnecdote: (id, patch) => update((s) => ({ ...s, anecdotes: s.anecdotes.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
        deleteAnecdote: (id) => update((s) => ({ ...s, anecdotes: s.anecdotes.filter((a) => a.id !== id) })),
        addTrip: (t) => update((s) => ({ ...s, trips: [t, ...s.trips] })),
        updateTrip: (id, patch) => update((s) => ({ ...s, trips: s.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
        removeTrip: (id) => update((s) => ({ ...s, trips: s.trips.filter((t) => t.id !== id) })),
        reset: () => setState(initialState),
    };

    return <Context value={{ state, hydrated, ...actions }}>{children}</Context>;
}

export function useApp() {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useApp doit être utilisé dans AppStateProvider");
    return ctx;
}
