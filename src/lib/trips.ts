import type { Role } from "./enums";
import type { Journey } from "./journeys";
import type { Trip } from "./trip";

export type TripRequest = { id: string; name: string; places: number };
export type TripPassenger = { name: string; places: number };
export type TripStatus = "a-venir" | "termine" | "annule";

// Un trajet du compte : réservation (passager) ou trajet publié (conducteur)
export type BookedTrip = {
    id: string;
    role: Role;
    status: TripStatus;
    pending: boolean;
    points: number;
    day: string;
    date: string;
    time: string;
    arrivalTime: string;
    from: string;
    to: string;
    driver: string;
    places: number;
    price: number;
    journey: Journey;
    passagers: TripPassenger[];
    demandes: TripRequest[];
};

const start = (t: BookedTrip) => `${t.date}T${t.time}`;

// À venir : du plus proche au plus lointain. Terminés et annulés : du plus récent au plus ancien.
export const sortTrips = (list: BookedTrip[], status: TripStatus) =>
    [...list].sort((a, b) => (status === "a-venir" ? 1 : -1) * start(a).localeCompare(start(b)));

export const nextTrip = (trips: BookedTrip[], role: Role) =>
    sortTrips(trips.filter((t) => t.status === "a-venir" && t.role === role), "a-venir")[0] ?? null;

export const tripHref = (t: BookedTrip) => `/trajets/mes-trajets/${t.id}`;

export function tripRowProps(t: BookedTrip) {
    const done = t.status === "termine";
    const state = done ? "Terminé" : t.status === "annule" ? "Annulé" : t.time;
    return {
        route: `${t.from} → ${t.to}`,
        meta: `${t.day} · ${state}${t.role === "conducteur" ? " · conducteur" : ""}`,
        badge: done ? `+${t.points} pts` : t.status === "annule" ? "Annulé" : t.pending ? "En attente" : "Bientôt",
        points: done,
        href: tripHref(t),
    };
}

export const seatsFree = (t: BookedTrip) => Math.max(0, t.places - t.passagers.reduce((n, p) => n + p.places, 0));

export function toNextTrip(t: BookedTrip): Trip {
    const base = { date: `${t.day} · ${t.time}`, from: t.from, to: t.to, href: tripHref(t), playlistHref: `/histoires/bibliotheque/trajet/${t.journey.id}` };
    if (t.role === "conducteur") {
        const names = t.passagers.map((p) => p.name);
        const free = seatsFree(t);
        return {
            ...base,
            passengers: names,
            seatsFree: free,
            companions: names.length ? `${names.join(" et ")} voyage${names.length > 1 ? "nt" : ""} avec toi` : "Aucun passager pour l’instant",
            seatInfo: `${free} place${free > 1 ? "s" : ""} libre${free > 1 ? "s" : ""}`,
        };
    }
    const { driver } = t.journey;
    return {
        ...base,
        driver: `avec ${driver.name} · ${driver.car}`,
        photo: driver.photo,
        headsetInfo: t.pending ? `En attente de confirmation par ${driver.name}` : `Casque Lunii à bord dès ${t.time}`,
    };
}
