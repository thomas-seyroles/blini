"use client";

import { useEffect, useRef } from "react";

const TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

const messages: Record<string, string> = {
    NotAllowedError: "L’accès au micro est refusé. Autorise-le dans les réglages du navigateur, puis réessaie.",
    SecurityError: "L’accès au micro est refusé. Autorise-le dans les réglages du navigateur, puis réessaie.",
    NotFoundError: "Aucun micro détecté sur cet appareil.",
    NotReadableError: "Le micro est utilisé par une autre application.",
};

// Enregistrement micro avec MediaRecorder : démarrage (demande d'accès), pause, reprise, instantané du fichier audio, abandon
export function useMicRecorder() {
    const recorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);

    const release = () => {
        recorder.current?.stream.getTracks().forEach((t) => t.stop());
        recorder.current = null;
    };

    useEffect(() => () => discard(), []); // eslint-disable-line react-hooks/exhaustive-deps

    // Rend un message d'erreur, ou null quand l'enregistrement a démarré
    const start = async () => {
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
            return "L’enregistrement n’est pas disponible ici. Il demande un navigateur récent et une connexion sécurisée (HTTPS).";
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = TYPES.find((t) => MediaRecorder.isTypeSupported(t));
            const r = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 32_000 });
            chunks.current = [];
            r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
            r.start(1000);
            recorder.current = r;
            return null;
        } catch (e) {
            return messages[(e as Error).name] ?? "Impossible de démarrer l’enregistrement.";
        }
    };

    const pause = () => recorder.current?.pause();
    const resume = () => recorder.current?.resume();

    // Fichier audio de tout ce qui a été capté jusqu'ici, sans arrêter l'enregistrement (qui reste en pause, prêt à reprendre)
    const snapshot = () =>
        new Promise<Blob | null>((resolve) => {
            const r = recorder.current;
            if (!r) return resolve(null);
            const done = () => resolve(new Blob(chunks.current, { type: r.mimeType }));
            if (r.state === "inactive") return done();
            r.addEventListener("dataavailable", done, { once: true });
            r.requestData();
        });

    const live = () => recorder.current !== null;

    function discard() {
        const r = recorder.current;
        if (r) {
            r.ondataavailable = null;
            r.onstop = null;
            if (r.state !== "inactive") r.stop();
        }
        release();
        chunks.current = [];
    }

    return { start, pause, resume, snapshot, live, discard };
}
