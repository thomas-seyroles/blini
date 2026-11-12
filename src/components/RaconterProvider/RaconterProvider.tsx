"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export type Draft = {
    durationSec: number;
    title: string;
    place: string;
    details: string;
    photo: File | null;
}

export type Created = { id: string; title: string };

export const emptyDraft: Draft = { durationSec: 0, title: "", place: "", details: "", photo: null };

type Raconter = {
    draft: Draft;
    patch: (p: Partial<Draft>) => void;
    clear: () => void;
    created: Created | null;
    setCreated: (c: Created | null) => void;
}

const Context = createContext<Raconter | null>(null);

export function RaconterProvider({ children }: { children: ReactNode }) {
    const [draft, setDraft] = useState(emptyDraft);
    const [created, setCreated] = useState<Created | null>(null);

    const value: Raconter = {
        draft,
        patch: (p) => setDraft((d) => ({ ...d, ...p })),
        clear: () => setDraft(emptyDraft),
        created,
        setCreated,
    };

    return <Context value={value}>{children}</Context>;
}

export function useRaconter() {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useRaconter doit être utilisé dans RaconterProvider");
    return ctx;
}

// Rechargement ou accès direct sans enregistrement : retour à l'étape qui manque
export function useRaconterGuard(step: "contexte" | "recapitulatif") {
    const ctx = useRaconter();
    const router = useRouter();
    const { durationSec, title, place } = ctx.draft;
    const target = durationSec < 3 ? "/raconter/enregistrement" : step === "recapitulatif" && (!title.trim() || !place.trim()) ? "/raconter/contexte" : null;

    useEffect(() => {
        if (target) router.replace(target);
    }, [target, router]);

    return target ? null : ctx;
}

export function usePhotoUrl(file: File | null) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setUrl(null);
            return;
        }
        const u = URL.createObjectURL(file);
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [file]);

    return url;
}
