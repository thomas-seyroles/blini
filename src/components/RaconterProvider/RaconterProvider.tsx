"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMicRecorder } from "../RecorderStep/useMicRecorder";

export type Draft = {
    durationSec: number;
    audio: Blob | null;
    title: string;
    place: string;
    details: string;
    photo: File | null;
}

export type Created = { id: string; title: string };

export const emptyDraft: Draft = { durationSec: 0, audio: null, title: "", place: "", details: "", photo: null };

type Raconter = {
    draft: Draft;
    patch: (p: Partial<Draft>) => void;
    clear: () => void;
    mic: ReturnType<typeof useMicRecorder>;
    created: Created | null;
    setCreated: (c: Created | null) => void;
}

const Context = createContext<Raconter | null>(null);

export function RaconterProvider({ children }: { children: ReactNode }) {
    const [draft, setDraft] = useState(emptyDraft);
    const [created, setCreated] = useState<Created | null>(null);

    // L'enregistreur vit avec le parcours : le retour depuis l'étape 2 reprend là où on s'était arrêté
    const mic = useMicRecorder();
    const pathname = usePathname();
    useEffect(() => {
        if (!/\/raconter\/(enregistrement|contexte|recapitulatif)$/.test(pathname)) mic.discard();
    }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    const value: Raconter = {
        mic,
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

export function useObjectUrl(file: Blob | null) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- l'URL d'objet doit être créée et révoquée dans l'effet
            setUrl(null);
            return;
        }
        const u = URL.createObjectURL(file);
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [file]);

    return url;
}
