"use client";

import { useMemo } from "react";
import { useApp } from "@/components/AppState/AppState";
import { parseCriteria, type Criteria } from "./search";

// Critères de recherche conservés sur l'appareil (chaîne JSON)
export function useSearch() {
    const { search, setSearch, hydrated } = useApp();
    const criteria = useMemo(() => parseCriteria(search), [search]);
    const setCriteria = (patch: Partial<Criteria>) => setSearch(JSON.stringify({ ...criteria, ...patch }));
    return { criteria, setCriteria, hydrated };
}
