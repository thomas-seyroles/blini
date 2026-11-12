export type Role = "passager" | "conducteur";

export type Trip = {
    date: string;
    from: string;
    to: string;
    driver?: string;
    photo?: string;
    headsetInfo?: string;
    companions?: string;
    seatInfo?: string;
    passengers?: string[];
    seatsFree?: number;
    href?: string;
};

export type Guests = { adultes: number; enfants: number; bebes: number; places: number };

export const emptyGuests: Guests = { adultes: 1, enfants: 0, bebes: 0, places: 1 };

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

export function guestsSummary(g: Guests, role: Role) {
    if (role === "conducteur") return `${plural(g.places, "place")} · casque Lunii à bord`;
    return [
        plural(g.adultes, "adulte"),
        g.enfants > 0 && plural(g.enfants, "enfant"),
        g.bebes > 0 && plural(g.bebes, "bébé"),
    ].filter(Boolean).join(" · ");
}

export function formatDay(d: Date, capital = false) {
    const s = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
    return capital ? s[0].toUpperCase() + s.slice(1) : s;
}

export const passengerCount = (g: Guests) => Math.max(1, g.adultes + g.enfants);

// Dates ISO locales (AAAA-MM-JJ), sans décalage de fuseau
export const isoOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const dateOf = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
};

export const shiftIso = (iso: string, n: number) => {
    const d = dateOf(iso);
    d.setDate(d.getDate() + n);
    return isoOf(d);
};

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export function dayInfo(iso: string) {
    const d = dateOf(iso);
    const month = (m: "short" | "long") => d.toLocaleDateString("fr-FR", { month: m });
    const weekday = d.toLocaleDateString("fr-FR", { weekday: "long" });
    return {
        short: cap(d.toLocaleDateString("fr-FR", { weekday: "short" })),
        date: `${d.getDate()} ${month("short")}`,
        weekday,
        long: `${cap(weekday)} ${d.getDate()} ${month("long")}`,
    };
}
