import type { CatalogIndex } from "@/lib/catalog";
import { PROMO_DISCOUNT } from "@/lib/quote";
import { packFullPrice, packPrice, type CartLine, type Pack, type Story } from "@/lib/stories";

// Un pack se paie selon les histoires déjà possédées dans la région. Une histoire dont le pack est dans le panier y est incluse.
export type ResolvedLine =
    | { line: CartLine; kind: "story"; story: Story; price: number; ownedIds: string[]; included: boolean }
    | { line: CartLine; kind: "pack"; pack: Pack; stories: Story[]; price: number; full: number; ownedIds: string[] };

export function resolveCart(cart: CartLine[], owned: string[], catalog: CatalogIndex): ResolvedLine[] {
    const packRegions = new Set(cart.flatMap((l) => (l.kind === "pack" ? (catalog.packById(l.id)?.regionSlug ?? []) : [])));
    return cart.flatMap((line): ResolvedLine[] => {
        if (line.kind === "story") {
            const story = catalog.storyById(line.id);
            if (!story) return [];
            const included = packRegions.has(story.regionSlug);
            return [{ line, kind: "story", story, price: included ? 0 : story.price, ownedIds: owned.includes(story.id) ? [story.id] : [], included }];
        }
        const pack = catalog.packById(line.id);
        if (!pack) return [];
        const stories = pack.storyIds.flatMap((id) => catalog.storyById(id) ?? []);
        return [{
            line,
            kind: "pack",
            pack,
            stories,
            price: packPrice(pack.regionSlug, owned, catalog.stories),
            full: packFullPrice(pack.regionSlug, owned, catalog.stories),
            ownedIds: stories.filter((s) => owned.includes(s.id)).map((s) => s.id),
        }];
    });
}

export const storyIdsOf = (lines: ResolvedLine[]) => [...new Set(lines.flatMap((l) => (l.kind === "pack" ? l.stories.map((s) => s.id) : [l.story.id])))];

// Seules les histoires vendues à l'unité bloquent le panier : un pack déduit ce qui est déjà possédé
export const isBlocked = (lines: ResolvedLine[]) => lines.some((l) => l.kind === "story" && l.ownedIds.length > 0);

export function totals(lines: ResolvedLine[], promo: string | null) {
    const subtotal = lines.reduce((sum, l) => sum + l.price, 0);
    const discount = promo ? Math.min(PROMO_DISCOUNT, subtotal) : 0;
    return { subtotal, discount, payable: subtotal - discount };
}
