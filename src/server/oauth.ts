import type { Service } from "@/lib/enums";

// Annuaire fictif des comptes proposés à la place d'un vrai OAuth : chaque compte appartient à un seul service.
// Un compte absent de la base (ou sans règlement accepté) passe par l'écran des conditions, qui l'inscrit.
export type OAuthAccount = { service: Service; externalId: string; firstName: string; lastName: string; email: string; photo: string };

export const OAUTH_ACCOUNTS: OAuthAccount[] = [
    { service: "blablacar", externalId: "bbc-thomas", firstName: "Thomas", lastName: "Seyroles", email: "seyroles.thomas@gmail.com", photo: "/images/pdp/thomas.webp" },
    { service: "lunii", externalId: "lunii-camille", firstName: "Camille", lastName: "Durand", email: "camille.durand@mail.fr", photo: "/images/pdp/femme-2.webp" },
    { service: "lunii", externalId: "lunii-nouveau", firstName: "Anaïs", lastName: "Colin", email: "anais.colin@mail.fr", photo: "/images/pdp/femme-14.webp" },
];

export const findAccount = (service: string, externalId: string) => OAUTH_ACCOUNTS.find((a) => a.service === service && a.externalId === externalId);
