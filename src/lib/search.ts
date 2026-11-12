import type { Guests } from "./trip";

export type Criteria = { from: string; to: string; aller: string; retour: string | null; guests: Guests };

export const DEFAULT_ALLER = "2026-11-15";

export const defaultCriteria: Criteria = {
    from: "",
    to: "",
    aller: DEFAULT_ALLER,
    retour: null,
    guests: { adultes: 1, enfants: 1, bebes: 0, places: 3 },
};

export function parseCriteria(raw: unknown): Criteria {
    if (typeof raw !== "string") return defaultCriteria;
    try {
        return { ...defaultCriteria, ...JSON.parse(raw) };
    } catch {
        return defaultCriteria;
    }
}
