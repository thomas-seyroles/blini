import { todayIso } from "./time";
import type { Guests } from "./trip";

export type Criteria = { from: string; to: string; aller: string; retour: string | null; guests: Guests };

export const defaultCriteria = (): Criteria => ({
    from: "",
    to: "",
    aller: todayIso(),
    retour: null,
    guests: { adultes: 1, enfants: 1, bebes: 0, places: 3 },
});

// Critères relus depuis le stockage local : une date passée revient à aujourd'hui
export function parseCriteria(raw: string | null): Criteria {
    const base = defaultCriteria();
    try {
        const saved: Criteria = { ...base, ...JSON.parse(raw ?? "{}") };
        return saved.aller < base.aller ? { ...saved, aller: base.aller, retour: null } : saved;
    } catch {
        return base;
    }
}
