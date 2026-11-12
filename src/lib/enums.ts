// Valeurs énumérées partagées par le schéma SQL et l'interface
export const ROLES = ["passager", "conducteur"] as const;
export const EQUIPMENTS = ["headset", "childSeat", "stories", "chat"] as const;
export const ITEM_CATEGORIES = ["objet", "histoire", "reduction", "badge"] as const;
export const TINTS = ["jaune", "turquoise", "bleu"] as const;
export const BOOKING_STATUSES = ["demande", "acceptee", "refusee", "annulee"] as const;
export const STORY_SOURCES = ["achat", "cadeau"] as const;
export const SERVICES = ["blablacar", "lunii"] as const;

export type Role = (typeof ROLES)[number];
export type Equipment = (typeof EQUIPMENTS)[number];
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];
export type Tint = (typeof TINTS)[number];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type StorySource = (typeof STORY_SOURCES)[number];
export type Service = (typeof SERVICES)[number];

export type Settings = Record<string, boolean | string>;
