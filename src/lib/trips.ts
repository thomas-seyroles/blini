import { addMinutes, city, cityName, distanceKm, drivers, estimatePrice, travelMinutes, type Journey } from "./journeys";
import { POINTS_PER_JOURNEY } from "./quote";
import type { Criteria } from "./search";
import { dayInfo, type Role, type Trip } from "./trip";
import { pdpAt } from "./pdp";

export type TripRequest = { id: string; name: string; places: number };
export type TripPassenger = { name: string; places: number };

export type BookedTrip = {
    id: string;
    day: string;
    time: string;
    from: string;
    to: string;
    driver: string;
    status: "a-venir" | "termine" | "annule";
    points: number;
    role?: Role;
    date?: string;
    arrivalTime?: string;
    places?: number;
    price?: number;
    journeyId?: string;
    passagers?: TripPassenger[];
    demandes?: TripRequest[];
};

export type TripStatus = BookedTrip["status"];

export const seedTrips: BookedTrip[] = [
    { id: "t-1", day: "Dim. 15 nov.", time: "08:30", from: "Paris", to: "Lyon", driver: "Julie", status: "a-venir", points: 40, date: "2026-11-15", places: 2, price: 36, journeyId: "a1" },
    { id: "t-2", day: "Sam. 22 nov.", time: "14:00", from: "Lyon", to: "Marseille", driver: "Karim", status: "a-venir", points: 20, date: "2026-11-22", places: 2, price: 30 },
    { id: "t-3", day: "Dim. 2 nov.", time: "09:15", from: "Nantes", to: "Paris", driver: "Sophie", status: "termine", points: 40, date: "2026-11-02", places: 2, price: 32 },
];

export const tripRole = (t: BookedTrip): Role => t.role ?? "passager";

// Anciennes données persistées sans date ISO : on la déduit du libellé du jour
const months = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
export function tripDate(t: BookedTrip) {
    if (t.date) return t.date;
    const m = t.day.match(/(\d+)\s+(\p{L}+)/u);
    const month = m ? months.findIndex((x) => m[2].startsWith(x)) + 1 : 0;
    return `2026-${String(month || 11).padStart(2, "0")}-${String(m?.[1] ?? 1).padStart(2, "0")}`;
}

const start = (t: BookedTrip) => `${tripDate(t)}T${t.time}`;

// À venir : du plus proche au plus lointain. Terminés et annulés : du plus récent au plus ancien.
export const sortTrips = (list: BookedTrip[], status: TripStatus) =>
    [...list].sort((a, b) => (status === "a-venir" ? 1 : -1) * start(a).localeCompare(start(b)));

export const nextTrip = (trips: BookedTrip[], role: Role) =>
    sortTrips(trips.filter((t) => t.status === "a-venir" && tripRole(t) === role), "a-venir")[0] ?? null;

export const tripHref = (t: BookedTrip) => `/trajets/mes-trajets/${t.id}`;

export function tripRowProps(t: BookedTrip) {
    const done = t.status === "termine";
    const state = done ? "Terminé" : t.status === "annule" ? "Annulé" : t.time;
    return {
        route: `${t.from} → ${t.to}`,
        meta: `${t.day} · ${state}${tripRole(t) === "conducteur" ? " · conducteur" : ""}`,
        badge: done ? `+${t.points} pts` : t.status === "annule" ? "Annulé" : "Bientôt",
        points: done,
        href: tripHref(t),
    };
}

export const driverByName = (name: string) => drivers.find((d) => d.name === name);

export const seatsFree = (t: BookedTrip) => Math.max(0, (t.places ?? 0) - (t.passagers ?? []).reduce((n, p) => n + p.places, 0));

export function toNextTrip(t: BookedTrip): Trip {
    const base = { date: `${t.day} · ${t.time}`, from: t.from, to: t.to, href: tripHref(t) };
    if (tripRole(t) === "conducteur") {
        const names = (t.passagers ?? []).map((p) => p.name);
        const free = seatsFree(t);
        return {
            ...base,
            passengers: names,
            seatsFree: free,
            companions: names.length ? `${names.join(" et ")} voyage${names.length > 1 ? "nt" : ""} avec toi` : "Aucun passager pour l’instant",
            seatInfo: `${free} place${free > 1 ? "s" : ""} libre${free > 1 ? "s" : ""}`,
        };
    }
    const driver = driverByName(t.driver);
    return {
        ...base,
        driver: `avec ${t.driver}${driver ? ` · ${driver.car}` : ""}`,
        photo: driver?.photo ?? pdpAt(0),
        headsetInfo: `Casque Lunii à bord dès ${t.time}`,
    };
}

// Réservation : un trajet passager par trajet réservé
export function bookedFromJourney(j: Journey, places: number, stamp: string): BookedTrip {
    const info = dayInfo(j.date);
    return {
        id: `bk-${stamp}-${j.id}`,
        day: `${info.short} ${info.date}`,
        time: j.departTime,
        from: city(j.from),
        to: city(j.to),
        driver: drivers.find((d) => d.id === j.driverId)?.name ?? "Conducteur",
        status: "a-venir",
        points: POINTS_PER_JOURNEY,
        role: "passager",
        date: j.date,
        arrivalTime: j.arrivalTime,
        places,
        price: j.price * places,
        journeyId: j.id,
    };
}

const pool: TripRequest[] = [
    { id: "d1", name: "Léa", places: 1 },
    { id: "d2", name: "Tom", places: 1 },
    { id: "d3", name: "Inès", places: 2 },
];

// Publication d'un trajet conducteur depuis l'accueil
export function publishedTrip(c: Criteria, firstName: string): BookedTrip {
    const info = dayInfo(c.aller);
    const from = cityName(c.from);
    const to = cityName(c.to);
    const km = distanceKm(from, to);
    const time = "08:30";
    const places = c.guests.places;
    return {
        id: `pub-${Date.now().toString(36)}`,
        day: `${info.short} ${info.date}`,
        time,
        from,
        to,
        driver: firstName,
        status: "a-venir",
        points: 30,
        role: "conducteur",
        date: c.aller,
        arrivalTime: addMinutes(time, travelMinutes(km)),
        places,
        price: estimatePrice(km),
        passagers: [],
        demandes: pool.slice(0, places >= 3 ? 3 : 2),
    };
}
