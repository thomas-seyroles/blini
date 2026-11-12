import type { Equipment } from "./enums";
import { dayInfo } from "./trip";

export type Kind = "certifie" | "standard" | "complet";

export type Driver = {
    id: string;
    name: string;
    female: boolean;
    car: string;
    color: string;
    rating: string;
    reviews: number;
    trips: number;
    photo: string;
    bio: string;
    equipments: Equipment[];
};

export type Passenger = { id: string; name: string; photo: string; trips: number };

export type Journey = {
    id: string;
    date: string;
    kind: Kind;
    departTime: string;
    arrivalTime: string;
    duration: string;
    km: number;
    price: number;
    seatsLeft: number;
    from: string;
    fromAddress: string;
    to: string;
    toAddress: string;
    driver: Driver;
    aboard: Passenger[];
    regions: string[];
};

export const PASSENGERS = 2;
export const DEFAULT_PHOTO = "/images/pdp/random-person.webp";

export const travelMinutes = (km: number) => Math.round((km * 0.47) / 5) * 5;
export const estimatePrice = (km: number) => Math.min(38, Math.max(8, Math.round(km * 0.038 + 7)));

const clock = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
export const durationLabel = (min: number) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
export const addMinutes = (time: string, min: number) => clock(Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) + min);
export const durationMin = (j: Journey) => {
    const [h, m] = j.duration.split(" h ").map(Number);
    return h * 60 + m;
};

// Libellé saisi (adresse ou ville) vers nom de ville
export function cityName(label: string) {
    const m = label.match(/\b\d{5}\s+(.+)$/);
    return (m ? m[1] : label.split(",")[0]).replace(/\s+\d+(er|e)?\s+arrondissement$/i, "").trim();
}

// Nom de ville vers identifiant de la table cities
export const citySlug = (name: string) =>
    name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const eur = (n: number) =>
    n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 });

export const placesLabel = (n: number) => `${n} place${n > 1 ? "s" : ""}`;
export const placesFor = (j: Journey, passengers = PASSENGERS) => Math.min(passengers, j.seatsLeft);

export const city = (place: string) => place.split(" · ")[0];
export const dayLine = (j: Journey) => `${dayInfo(j.date).short} ${dayInfo(j.date).date} · ${city(j.from)} ${j.departTime} → ${city(j.to)} ${j.arrivalTime}`;
