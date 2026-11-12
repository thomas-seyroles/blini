"use client";

import { useEffect, useRef, useState } from "react";

// Lecteur : audio réel quand une source existe, sinon lecture fictive (position qui avance, sans son)
export function usePlayer(durationSec: number, src?: string | null) {
    const [playing, setPlaying] = useState(false);
    const [pos, setPos] = useState(0);
    const audio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!src) return;
        const a = new Audio(src);
        audio.current = a;
        a.ontimeupdate = () => setPos(a.currentTime);
        a.onended = () => { setPlaying(false); setPos(0); };
        return () => { a.pause(); audio.current = null; };
    }, [src]);

    useEffect(() => {
        if (src) {
            if (playing) audio.current?.play().catch(() => setPlaying(false));
            else audio.current?.pause();
            return;
        }
        if (!playing) return;
        const id = setInterval(() => {
            setPos((p) => {
                if (p + 0.25 >= durationSec) {
                    setPlaying(false);
                    return 0;
                }
                return p + 0.25;
            });
        }, 250);
        return () => clearInterval(id);
    }, [playing, durationSec, src]);

    return {
        playing,
        pos,
        progress: durationSec > 0 ? Math.min(pos / durationSec, 1) : 0,
        toggle: () => setPlaying((p) => !p),
        stop: () => {
            setPlaying(false);
            setPos(0);
            if (audio.current) audio.current.currentTime = 0;
        },
    };
}
