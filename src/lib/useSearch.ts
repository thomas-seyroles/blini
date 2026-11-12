"use client";

import { useMemo } from "react";
import { useApp } from "@/components/AppState/AppState";
import { parseCriteria, type Criteria } from "./search";

// Critères de recherche conservés dans state.settings.search (chaîne JSON)
export function useSearch() {
    const { state, update, hydrated } = useApp();
    const raw = state.settings.search;
    const criteria = useMemo(() => parseCriteria(raw), [raw]);

    const setCriteria = (patch: Partial<Criteria>) =>
        update((s) => ({
            ...s,
            settings: { ...s.settings, search: JSON.stringify({ ...parseCriteria(s.settings.search), ...patch }) },
        }));

    return { criteria, setCriteria, hydrated };
}
