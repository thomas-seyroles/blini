import type { AppData } from "./appData";

export const PACKAGE_MIN_TRIPS = 20;
// Ma Fabrique à Histoires, prix public sur lunii.com : 69,90 €. Offre conducteur : moitié prix.
export const CONTEUSE_REGULAR_CENTS = 6990;
export const CONTEUSE_DISCOUNT = 50;
export const CONTEUSE_CENTS = Math.round((CONTEUSE_REGULAR_CENTS * (100 - CONTEUSE_DISCOUNT)) / 100);
export const CONTEUSE_REGULAR_PRICE = CONTEUSE_REGULAR_CENTS / 100;
export const CONTEUSE_PRICE = CONTEUSE_CENTS / 100;

export const packageTotal = (conteuse: boolean) => (conteuse ? CONTEUSE_CENTS : 0);

// Conducteur vérifié : compte BlaBlaCar lié et assez de trajets complétés
export const canClaimPackage = (blablacarLinked: boolean, trips: number) => blablacarLinked && trips >= PACKAGE_MIN_TRIPS;

export function packageStatus(s: AppData) {
    const trips = s.blablacarTrips;
    return {
        eligible: canClaimPackage(s.linked.blablacar, trips),
        ordered: !!s.packageOrder,
        trips: Math.min(trips, PACKAGE_MIN_TRIPS),
        linked: s.linked.blablacar,
    };
}
