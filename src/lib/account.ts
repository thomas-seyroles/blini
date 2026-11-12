import type { AppState } from "@/components/AppState/AppState";

export const TRIPS_REQUIRED = 3;

export const flag = (s: AppState, key: string, fallback = true) => {
    const v = s.settings[key];
    return typeof v === "boolean" ? v : fallback;
};

export const choice = (s: AppState, key: string, fallback: string) => {
    const v = s.settings[key];
    return typeof v === "string" ? v : fallback;
};

export const setSetting = (key: string, value: boolean | string) => (s: AppState): AppState => ({
    ...s,
    settings: { ...s.settings, [key]: value },
});

export const LANGUES: Record<string, string> = { fr: "Français", en: "English", es: "Español" };
export const APPARENCES: Record<string, string> = { auto: "Automatique", clair: "Clair", sombre: "Sombre" };

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function certification(s: AppState) {
    const { firstName, lastName, email } = s.profile;
    const done = s.trips.filter((t) => t.status === "termine").length;
    const checks = {
        identite: !!firstName.trim() && !!lastName.trim() && isEmail(email),
        compteLie: s.linked.blablacar || s.linked.lunii,
        reglement: flag(s, "reglement"),
        experience: done >= TRIPS_REQUIRED,
    };
    return { ...checks, remaining: Math.max(0, TRIPS_REQUIRED - done), certified: Object.values(checks).every(Boolean) };
}
