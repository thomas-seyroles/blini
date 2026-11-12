import type { AppData } from "./appData";
import { PACKAGE_MIN_TRIPS } from "./package";

export const flag = (s: AppData, key: string, fallback = true) => {
    const v = s.settings[key];
    return typeof v === "boolean" ? v : fallback;
};

export const choice = (s: AppData, key: string, fallback: string) => {
    const v = s.settings[key];
    return typeof v === "string" ? v : fallback;
};

export const LANGUES: Record<string, string> = { fr: "Français", en: "English", es: "Español" };
export const APPARENCES: Record<string, string> = { auto: "Automatique", clair: "Clair", sombre: "Sombre" };

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function certification(s: AppData) {
    const { firstName, lastName, email, rulesAccepted } = s.profile;
    const done = s.blablacarTrips;
    const checks = {
        identite: !!firstName.trim() && !!lastName.trim() && isEmail(email),
        compteLie: s.linked.blablacar || s.linked.lunii,
        reglement: rulesAccepted,
        experience: done >= PACKAGE_MIN_TRIPS,
    };
    return { ...checks, remaining: Math.max(0, PACKAGE_MIN_TRIPS - done), certified: Object.values(checks).every(Boolean) };
}
