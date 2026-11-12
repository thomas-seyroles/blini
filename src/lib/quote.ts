import { placesFor, type Journey } from "./journeys";
import { POINTS } from "./points";

// Règles de prix d'une réservation, appliquées à l'identique par l'interface et par le serveur
export const PACK_PRICE = 4.9;
export const SERVICE_FEE = 2.5;
export const VOUCHER_ITEM_ID = "remise-trajet";
export const VOUCHER_DISCOUNT = 5;
export const PROMO_CODE = "BLUNI5";
export const PROMO_DISCOUNT = 5;
export const PACK_SIZE = 3;

export type Booking = {
    aller: Journey | null;
    retour: Journey | null;
    pack: boolean;
    useVoucher: boolean;
    promo: string | null;
    method: string;
    passengers: number;
};

// La remise achetée dans Cadeaux ne vaut que sur un trajet certifié Bluni
export const canUseVoucher = (aller: Journey | null) => aller?.kind === "certifie";

export function quote(b: Pick<Booking, "aller" | "retour" | "pack" | "useVoucher" | "promo" | "passengers">) {
    const journeys = [b.aller, b.retour].filter((j): j is Journey => !!j);
    const trips = journeys.reduce((sum, j) => sum + j.price * placesFor(j, b.passengers), 0);
    const pack = b.pack ? PACK_PRICE : 0;
    const total = trips + pack + SERVICE_FEE;
    const discount = (b.useVoucher ? VOUCHER_DISCOUNT : 0) + (b.promo ? PROMO_DISCOUNT : 0);
    return {
        aller: b.aller,
        retour: b.retour,
        journeys,
        trips,
        pack,
        total,
        payable: Math.max(0, total - discount),
        earned: journeys.length * POINTS.trajet,
    };
}
