import type { ItemCategory, Tint } from "./enums";

export type Item = {
    id: string;
    title: string;
    description: string;
    cost: number;
    image: string;
    category: ItemCategory;
    tint: Tint;
};

export const categoryLabels: Record<ItemCategory, string> = {
    objet: "Objet collector",
    histoire: "Histoire",
    reduction: "Remise trajet",
    badge: "Badge",
};

// Prochain objectif : l’item non obtenu le moins cher qu’on ne peut pas encore payer
export const nextGoal = (items: Item[], points: number, inventory: string[]) =>
    items
        .filter((i) => !inventory.includes(i.id) && i.cost > points)
        .sort((a, b) => a.cost - b.cost)[0];

export const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
