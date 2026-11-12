import { journeyById, placesFor, type Journey } from "./journeys";

export const PACK_PRICE = 4.9;
export const SERVICE_FEE = 2.5;
export const POINTS_USED = 500;
export const POINTS_DISCOUNT = 5;
export const POINTS_BALANCE = 1240;
export const PROMO_CODE = "BLUNI5";
export const PROMO_DISCOUNT = 5;
export const POINTS_PER_JOURNEY = 20;

export type Booking = {
    allerId: string | null;
    retourId: string | null;
    pack: boolean;
    usePoints: boolean;
    promo: string | null;
    method: string;
    passengers: number;
};

export function quote(b: Booking) {
    const aller = b.allerId ? journeyById(b.allerId) ?? null : null;
    const retour = b.retourId ? journeyById(b.retourId) ?? null : null;
    const journeys = [aller, retour].filter((j): j is Journey => !!j);
    const trips = journeys.reduce((sum, j) => sum + j.price * placesFor(j, b.passengers), 0);
    const pack = b.pack ? PACK_PRICE : 0;
    const total = trips + pack + SERVICE_FEE;
    const discount = (b.usePoints ? POINTS_DISCOUNT : 0) + (b.promo ? PROMO_DISCOUNT : 0);
    return {
        aller,
        retour,
        journeys,
        trips,
        pack,
        total,
        payable: Math.max(0, total - discount),
        earned: journeys.length * POINTS_PER_JOURNEY,
    };
}
