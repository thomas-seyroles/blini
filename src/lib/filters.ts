import { driverById, durationMin, type Journey } from "./journeys";

export const PRICE_MIN = 10;
export const PRICE_MAX = 40;

export const sorts = [
    { id: "depart", label: "Heure de départ" },
    { id: "prix", label: "Prix le plus bas" },
    { id: "duree", label: "Trajet le plus court" },
] as const;

export const slots = [
    { id: "avant9", label: "Avant 9 h", test: (h: number) => h < 9 },
    { id: "9-12", label: "9 h – 12 h", test: (h: number) => h >= 9 && h < 12 },
    { id: "12-18", label: "12 h – 18 h", test: (h: number) => h >= 12 && h < 18 },
    { id: "apres18", label: "Après 18 h", test: (h: number) => h >= 18 },
] as const;

export type OptionId = "certifies" | "casque" | "siege";

export type Filters = {
    sort: (typeof sorts)[number]["id"];
    slot: string | null;
    price: number;
    on: Record<OptionId, boolean>;
};

export const defaultFilters: Filters = {
    sort: "depart",
    slot: null,
    price: PRICE_MAX,
    on: { certifies: false, casque: false, siege: false },
};

export const activeCount = (f: Filters) =>
    Object.values(f.on).filter(Boolean).length + (f.slot ? 1 : 0) + (f.price < PRICE_MAX ? 1 : 0);

export const availableCount = (list: Journey[]) => list.filter((j) => j.kind !== "complet").length;

export function applyFilters(list: Journey[], f: Filters) {
    const slot = slots.find((s) => s.id === f.slot);
    const keep = (j: Journey) => {
        const equipments = driverById(j.driverId).equipments;
        return (
            (!f.on.certifies || j.kind === "certifie") &&
            (!f.on.casque || equipments.includes("headset")) &&
            (!f.on.siege || equipments.includes("childSeat")) &&
            (!slot || slot.test(Number(j.departTime.slice(0, 2)))) &&
            j.price <= f.price
        );
    };
    const key = { depart: (j: Journey) => j.departTime, prix: (j: Journey) => j.price, duree: durationMin }[f.sort];
    return list.filter(keep).sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : a.departTime.localeCompare(b.departTime)));
}
