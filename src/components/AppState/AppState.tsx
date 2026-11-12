"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppData } from "@/lib/appData";
import { indexCatalog, type Catalog, type CatalogIndex } from "@/lib/catalog";
import type { CartLine } from "@/lib/stories";

export type { CartLine };

// Données du compte (serveur) + état propre à l'appareil (panier, lecture en cours, recherche)
export type AppState = AppData & { cart: CartLine[]; nowPlaying: string | null; queue: string[] | null };

type Local = { cart: CartLine[]; nowPlaying: string | null; queue: string[] | null; search: string | null };

type App = {
    state: AppState;
    catalog: CatalogIndex;
    hydrated: boolean;
    search: string | null;
    setSearch: (raw: string) => void;
    addToCart: (line: CartLine) => void;
    removeFromCart: (line: CartLine) => void;
    setCart: (fn: (cart: CartLine[]) => CartLine[]) => void;
    clearCart: () => void;
    play: (storyId: string, queue?: string[]) => void;
    flash: string;
    setFlash: (message: string) => void;
};

const KEY = "bluni-local-v2";
const empty: Local = { cart: [], nowPlaying: null, queue: null, search: null };
const Context = createContext<App | null>(null);

const same = (a: CartLine, b: CartLine) => a.kind === b.kind && a.id === b.id;

export function AppStateProvider({ data, catalog, children }: { data: AppData; catalog: Catalog; children: ReactNode }) {
    const [local, setLocal] = useState(empty);
    const [hydrated, setHydrated] = useState(false);
    const [flash, setFlash] = useState("");

    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture du localStorage, impossible au rendu serveur
            if (raw) setLocal({ ...empty, ...JSON.parse(raw) });
        } catch {}
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem(KEY, JSON.stringify(local));
        } catch {}
    }, [local, hydrated]);

    const index = useMemo(() => indexCatalog(catalog), [catalog]);
    const state = useMemo(() => ({ ...data, cart: local.cart, nowPlaying: local.nowPlaying, queue: local.queue }), [data, local.cart, local.nowPlaying, local.queue]);

    // Actions stables d'un rendu à l'autre : elles ne dépendent que des setters
    const actions = useMemo(() => {
        const setCart = (fn: (cart: CartLine[]) => CartLine[]) => setLocal((l) => ({ ...l, cart: fn(l.cart) }));
        return {
            setSearch: (search: string) => setLocal((l) => ({ ...l, search })),
            addToCart: (line: CartLine) => setCart((c) => (c.some((l) => same(l, line)) ? c : [...c, line])),
            removeFromCart: (line: CartLine) => setCart((c) => c.filter((l) => !same(l, line))),
            setCart,
            clearCart: () => setCart(() => []),
            play: (nowPlaying: string, queue?: string[]) => setLocal((l) => ({ ...l, nowPlaying, queue: queue ?? null })),
            setFlash,
        };
    }, []);

    const value: App = { state, catalog: index, hydrated, search: local.search, flash, ...actions };

    return <Context value={value}>{children}</Context>;
}

export function useApp() {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useApp doit être utilisé dans AppStateProvider");
    return ctx;
}

export const useCatalog = () => useApp().catalog;
