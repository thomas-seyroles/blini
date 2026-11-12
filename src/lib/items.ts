export type Tint = "jaune" | "turquoise" | "bleu";
export type ItemCategory = "objet" | "histoire" | "reduction" | "badge";

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

export const items: Item[] = [
    { id: "autocollants", title: "Autocollants des régions", description: "Une planche d’autocollants illustrés aux couleurs des régions que tu as traversées. À coller sur le casque Lunii ou le cahier de voyage des enfants.", cost: 600, image: "/images/cadeaux/item-autocollants.svg", category: "objet", tint: "jaune" },
    { id: "coque-route-etoilee", title: "Coque route étoilée", description: "Une coque pour ta Fabrique à histoires, décorée d’une route sous les étoiles. Édition limitée Bluni.", cost: 900, image: "/images/cadeaux/item-coque.svg", category: "objet", tint: "turquoise" },
    { id: "casque-bluni", title: "Casque édition Bluni", description: "Le casque audio Lunii aux couleurs de Bluni, pour écouter les histoires du trajet sans déranger le conducteur.", cost: 1500, image: "/images/cadeaux/item-casque.svg", category: "objet", tint: "bleu" },
    { id: "histoire-mystere", title: "Histoire mystère", description: "Une histoire régionale choisie par l’équipe d’auteurs Lunii, offerte et ajoutée à ta bibliothèque. Surprise garantie.", cost: 2000, image: "/images/cadeaux/item-mystere.svg", category: "histoire", tint: "jaune" },
    { id: "remise-trajet", title: "Remise de 5 € sur un trajet", description: "Un bon de réduction de 5 € valable sur ta prochaine réservation de trajet certifié Bluni.", cost: 300, image: "/images/mascotte-voiture.png", category: "reduction", tint: "turquoise" },
    { id: "badge-bretagne", title: "Badge Bretagne", description: "Le badge de la région Bretagne pour ta collection. Il se range avec tes autres badges de voyage.", cost: 400, image: "/images/couvertures/bretagne.png", category: "badge", tint: "bleu" },
];

export const itemById = (id: string) => items.find((i) => i.id === id);

// Prochain objectif : l’item non obtenu le moins cher qu’on ne peut pas encore payer
export const nextGoal = (points: number, inventory: string[]) =>
    items
        .filter((i) => !inventory.includes(i.id) && i.cost > points)
        .sort((a, b) => a.cost - b.cost)[0];

export const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
