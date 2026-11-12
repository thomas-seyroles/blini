"use client";

import { useEffect, useState } from "react";

// Lecture fictive : fait avancer une position en secondes, sans audio réel
export function useSimulatedPlayer(durationSec: number) {
    const [playing, setPlaying] = useState(false);
    const [pos, setPos] = useState(0);

    useEffect(() => {
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
    }, [playing, durationSec]);

    return {
        playing,
        pos,
        progress: durationSec > 0 ? pos / durationSec : 0,
        toggle: () => setPlaying((p) => !p),
        stop: () => {
            setPlaying(false);
            setPos(0);
        },
    };
}
