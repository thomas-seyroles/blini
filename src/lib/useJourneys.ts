"use client";

import { useEffect, useState } from "react";
import type { Journey } from "./journeys";

type Result = { key: string; journeys: Journey[]; regions: string[] };

// Trajets disponibles entre deux villes un jour donné, via la route /api/journeys
export function useJourneys(from: string, to: string, date: string) {
    const key = `${from}|${to}|${date}`;
    const [result, setResult] = useState<Result | null>(null);

    useEffect(() => {
        if (!from || !to) return;
        const controller = new AbortController();
        fetch(`/api/journeys?${new URLSearchParams({ from, to, date })}`, { signal: controller.signal })
            .then((res) => (res.ok ? res.json() : { journeys: [], regions: [] }))
            .then((data) => setResult({ key, journeys: data.journeys, regions: data.regions }))
            .catch(() => !controller.signal.aborted && setResult({ key, journeys: [], regions: [] }));
        return () => controller.abort();
    }, [key, from, to, date]);

    const ready = result?.key === key;
    return { journeys: ready ? result.journeys : [], regions: ready ? result.regions : [], loading: !ready };
}
