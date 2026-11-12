import { pdpAt } from "./pdp";
import { dayInfo } from "./trip";

export type Kind = "certifie" | "standard" | "complet";
export type Equipment = "headset" | "childSeat" | "stories" | "chat";

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

export type Journey = {
    id: string;
    direction: "aller" | "retour";
    day: number;
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
    driverId: string;
    aboard: string[];
};

export const PASSENGERS = 2;

export const drivers: Driver[] = [
    { id: "julie", name: "Julie", female: true, car: "Peugeot 308", color: "bleue", rating: "4,9", reviews: 128, trips: 212, photo: pdpAt(0), bio: "Je fais Paris-Lyon toutes les semaines. Les enfants adorent le casque Lunii, moi j’adore les anecdotes des régions traversées.", equipments: ["headset", "childSeat", "stories", "chat"] },
    { id: "karim", name: "Karim", female: false, car: "Renault Scénic", color: "grise", rating: "4,8", reviews: 64, trips: 97, photo: pdpAt(1), bio: "Conduite tranquille, musique douce et histoires pour les petits. Je prête le casque avec plaisir.", equipments: ["headset", "stories"] },
    { id: "sophie", name: "Sophie", female: true, car: "Citroën C4", color: "blanche", rating: "4,7", reviews: 41, trips: 58, photo: pdpAt(2), bio: "Je pars tôt et je roule détendue. Siège enfant disponible sur demande.", equipments: ["childSeat", "chat"] },
    { id: "marc", name: "Marc", female: false, car: "Tesla Model 3", color: "noire", rating: "4,9", reviews: 210, trips: 340, photo: pdpAt(0), bio: "Trajets silencieux ou bavards, au choix. Voiture électrique, recharge pendant la pause.", equipments: ["headset", "chat"] },
    { id: "nadia", name: "Nadia", female: true, car: "Renault Clio", color: "rouge", rating: "4,6", reviews: 22, trips: 31, photo: pdpAt(1), bio: "Je rentre à Paris tous les dimanches soir. Ambiance calme, arrêt café possible.", equipments: ["childSeat"] },
];

type Base = Omit<Journey, "id" | "direction" | "day" | "date">;

export const outbound: Journey[] = ([
    { id: "a1", kind: "certifie", departTime: "08:30", arrivalTime: "12:10", duration: "3 h 40", km: 465, price: 18, seatsLeft: 2, from: "Paris · Bercy", fromAddress: "Parking du parc de Bercy, 75012", to: "Lyon · Part-Dieu", toAddress: "Rue de la Villette, 69003", driverId: "julie", aboard: ["Karim", "Sophie"] },
    { id: "a2", kind: "certifie", departTime: "09:15", arrivalTime: "13:00", duration: "3 h 45", km: 470, price: 21, seatsLeft: 1, from: "Paris · Porte d’Italie", fromAddress: "Avenue d’Italie, 75013", to: "Lyon · Perrache", toAddress: "Cours de Verdun Rambaud, 69002", driverId: "karim", aboard: ["Léa", "Tom", "Inès"] },
    { id: "a3", kind: "standard", departTime: "10:00", arrivalTime: "14:05", duration: "4 h 05", km: 480, price: 16, seatsLeft: 3, from: "Paris · Gare de Lyon", fromAddress: "Place Louis-Armand, 75012", to: "Villeurbanne · Gratte-Ciel", toAddress: "Avenue Henri Barbusse, 69100", driverId: "sophie", aboard: [] },
    { id: "a4", kind: "complet", departTime: "11:30", arrivalTime: "15:20", duration: "3 h 50", km: 468, price: 19, seatsLeft: 0, from: "Paris · Bercy", fromAddress: "Parking du parc de Bercy, 75012", to: "Lyon · Perrache", toAddress: "Cours de Verdun Rambaud, 69002", driverId: "marc", aboard: ["Camille", "Hugo", "Zoé"] },
] as (Base & { id: string })[]).map((j) => ({ ...j, direction: "aller", day: 15, date: "2026-11-15" }));

const returnTemplates: (Base & { tpl: string })[] = [
    { tpl: "r1", kind: "certifie", departTime: "17:00", arrivalTime: "20:45", duration: "3 h 45", km: 465, price: 17, seatsLeft: 2, from: "Lyon · Part-Dieu", fromAddress: "Rue de la Villette, 69003", to: "Paris · Bercy", toAddress: "Parking du parc de Bercy, 75012", driverId: "julie", aboard: ["Léa"] },
    { tpl: "r2", kind: "standard", departTime: "18:30", arrivalTime: "22:20", duration: "3 h 50", km: 470, price: 15, seatsLeft: 3, from: "Lyon · Perrache", fromAddress: "Cours de Verdun Rambaud, 69002", to: "Paris · Gare de Lyon", toAddress: "Place Louis-Armand, 75012", driverId: "nadia", aboard: [] },
    { tpl: "r3", kind: "certifie", departTime: "19:30", arrivalTime: "23:15", duration: "3 h 45", km: 468, price: 19, seatsLeft: 2, from: "Lyon · Part-Dieu", fromAddress: "Rue de la Villette, 69003", to: "Paris · Porte d’Italie", toAddress: "Avenue d’Italie, 75013", driverId: "karim", aboard: ["Inès"] },
];

const returnsByDay: Record<number, string[]> = {
    15: ["r2"],
    16: ["r1", "r2", "r3"],
    17: ["r1", "r3"],
    18: ["r1", "r2"],
    19: ["r2", "r3"],
};

const returnsOn = (day: number): Journey[] =>
    returnsByDay[day].map((tpl) => {
        const { tpl: _, ...base } = returnTemplates.find((t) => t.tpl === tpl)!;
        return { ...base, id: `${tpl}-${day}`, direction: "retour", day, date: `2026-11-${day}` };
    });

const allJourneys = [...outbound, ...Object.keys(returnsByDay).flatMap((d) => returnsOn(Number(d)))];

// Trajets générés : déterministes pour une paire de villes et une date
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const hash = (s: string) => {
    let h = 2166136261;
    for (const c of s) h = Math.imul(h ^ c.codePointAt(0)!, 16777619);
    return h >>> 0;
};

const knownKm: Record<string, number> = {
    "lyon|paris": 465,
    "marseille|paris": 775,
    "lyon|marseille": 315,
    "nantes|paris": 385,
    "paris|strasbourg": 490,
    "paris|toulouse": 680,
    "bordeaux|paris": 585,
    "lille|paris": 225,
    "dijon|paris": 315,
    "dijon|lyon": 195,
};

export const distanceKm = (a: string, b: string) => {
    const key = [norm(a), norm(b)].sort().join("|");
    return knownKm[key] ?? 90 + (hash(key) % 640);
};

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

const hex = (s: string) => Array.from(new TextEncoder().encode(s), (b) => b.toString(16).padStart(2, "0")).join("");
const unhex = (h: string) => new TextDecoder().decode(Uint8Array.from(h.match(/../g)!, (x) => parseInt(x, 16)));

const slotTimes = ["06:30", "07:45", "09:00", "10:30", "12:15", "14:00", "16:30", "18:00", "19:15"];
const spots = [
    { name: "Gare", address: "Parvis de la gare" },
    { name: "Centre-ville", address: "Place de la mairie" },
    { name: "Parking relais", address: "Avenue de la République" },
];
const others = ["Léa", "Tom", "Inès", "Camille"];

function generate(from: string, to: string, date: string, direction: Journey["direction"]): Journey[] {
    const seed = hash(`${norm(from)}|${norm(to)}|${date}`);
    if (seed % 7 === 0) return [];
    const count = 2 + ((seed >>> 3) % 4);
    const km = distanceKm(from, to);
    const base = travelMinutes(km);
    const times = Array.from({ length: count }, (_, i) => slotTimes[(seed + i * 2) % slotTimes.length]).sort();
    return times.map((departTime, i) => {
        const h = hash(`${seed}-${i}`);
        const minutes = base + ((h >>> 4) % 4) * 5;
        const roll = h % 10;
        const kind: Kind = roll < 5 ? "certifie" : roll < 8 ? "standard" : "complet";
        const a = spots[h % 3];
        const b = spots[(h >>> 2) % 3];
        return {
            id: `g_${direction}_${date}_${hex(from)}_${hex(to)}_${i}`,
            direction,
            day: Number(date.slice(8)),
            date,
            kind,
            departTime,
            arrivalTime: addMinutes(departTime, minutes),
            duration: durationLabel(minutes),
            km,
            price: Math.min(38, Math.max(8, estimatePrice(km) - 3 + (h % 7))),
            seatsLeft: kind === "complet" ? 0 : 1 + (h % 3),
            from: `${from} · ${a.name}`,
            fromAddress: `${a.address}, ${from}`,
            to: `${to} · ${b.name}`,
            toAddress: `${b.address}, ${to}`,
            driverId: drivers[h % drivers.length].id,
            aboard: others.slice(0, (h >>> 6) % 4),
        };
    });
}

// Paris-Lyon le 15 nov. et Lyon-Paris du 15 au 19 nov. gardent les trajets de la maquette
export function journeysOn(fromLabel: string, toLabel: string, date: string, direction: Journey["direction"] = "aller"): Journey[] {
    const from = cityName(fromLabel);
    const to = cityName(toLabel);
    const pair = `${norm(from)}>${norm(to)}`;
    const day = Number(date.slice(8));
    if (pair === "paris>lyon" && date === "2026-11-15") return outbound.map((j) => ({ ...j, direction }));
    if (pair === "lyon>paris" && date.startsWith("2026-11-") && returnsByDay[day]) return returnsOn(day).map((j) => ({ ...j, direction }));
    return generate(from, to, date, direction);
}

export function journeyById(id: string): Journey | undefined {
    const found = allJourneys.find((j) => j.id === id);
    if (found) return found;
    const m = id.match(/^g_(aller|retour)_(\d{4}-\d{2}-\d{2})_([0-9a-f]+)_([0-9a-f]+)_(\d+)$/);
    return m ? generate(unhex(m[3]), unhex(m[4]), m[2], m[1] as Journey["direction"])[Number(m[5])] : undefined;
}

export const driverById = (id: string) => drivers.find((d) => d.id === id)!;

export const eur = (n: number) =>
    n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 });

export const placesLabel = (n: number) => `${n} place${n > 1 ? "s" : ""}`;
export const placesFor = (j: Journey, passengers = PASSENGERS) => Math.min(passengers, j.seatsLeft);

export const city = (place: string) => place.split(" · ")[0];
export const dayLine = (j: Journey) => `${dayInfo(j.date).short} ${dayInfo(j.date).date} · ${city(j.from)} ${j.departTime} → ${city(j.to)} ${j.arrivalTime}`;
