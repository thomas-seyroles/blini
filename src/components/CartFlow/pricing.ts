import { PROMO_DISCOUNT } from "@/lib/quote";
import { packById, storyById, type Pack, type Story } from "@/lib/stories";
import type { CartLine } from "../AppState/AppState";

export type ResolvedLine =
    | { line: CartLine; kind: "story"; story: Story; price: number; ownedIds: string[] }
    | { line: CartLine; kind: "pack"; pack: Pack; stories: Story[]; price: number; ownedIds: string[] };

export function resolveCart(cart: CartLine[], owned: string[]): ResolvedLine[] {
    return cart.flatMap((line): ResolvedLine[] => {
        if (line.kind === "story") {
            const story = storyById(line.id);
            return story ? [{ line, kind: "story", story, price: story.price, ownedIds: owned.includes(story.id) ? [story.id] : [] }] : [];
        }
        const pack = packById(line.id);
        if (!pack) return [];
        const stories = pack.storyIds.flatMap((id) => storyById(id) ?? []);
        return [{ line, kind: "pack", pack, stories, price: pack.price, ownedIds: stories.filter((s) => owned.includes(s.id)).map((s) => s.id) }];
    });
}

export const storyIdsOf = (lines: ResolvedLine[]) => [...new Set(lines.flatMap((l) => (l.kind === "pack" ? l.stories.map((s) => s.id) : [l.story.id])))];

export const packFull = (pack: Pack) => pack.storyIds.reduce((sum, id) => sum + (storyById(id)?.price ?? 0), 0);
export const packSaving = (pack: Pack) => packFull(pack) - pack.price;

export function totals(lines: ResolvedLine[], promo: string | null) {
    const subtotal = lines.reduce((sum, l) => sum + l.price, 0);
    const discount = promo ? Math.min(PROMO_DISCOUNT, subtotal) : 0;
    return { subtotal, discount, payable: subtotal - discount };
}
