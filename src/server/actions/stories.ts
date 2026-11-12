"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { PROMO_CODE, PROMO_DISCOUNT } from "@/lib/quote";
import { ownedInRegion, packPriceCents, type CartLine } from "@/lib/stories";
import { requireUser } from "../auth";
import { db } from "../db";
import { userBadges, userStories } from "../db/schema";
import { getCatalogIndex } from "../queries/catalog";

// Achat du panier avec faux paiement : les histoires rejoignent directement la bibliothèque.
// Un pack se paie selon les histoires déjà possédées dans sa région, et une histoire dont le pack est acheté en même temps y est incluse.
export async function purchaseStories(lines: CartLine[], promo: string | null) {
    const user = await requireUser();
    const catalog = await getCatalogIndex();
    if (!Array.isArray(lines) || !lines.length) return { error: "Ton panier est vide." };
    if (lines.some((l) => !(l.kind === "pack" ? catalog.packById(l.id) : catalog.storyById(l.id)))) return { error: "Un article n’existe plus." };

    const ownedRows = await db.select({ id: userStories.storyId }).from(userStories).where(eq(userStories.userId, user.id));
    const owned = ownedRows.map((r) => r.id);
    const packs = lines.filter((l) => l.kind === "pack").map((l) => catalog.packById(l.id)!);
    const packRegions = new Set(packs.map((p) => p.regionSlug));
    const singles = lines.filter((l) => l.kind === "story").map((l) => catalog.storyById(l.id)!);
    if (singles.some((s) => owned.includes(s.id))) return { error: "Tu possèdes déjà une de ces histoires." };

    const subtotalCents =
        packs.reduce((sum, p) => sum + packPriceCents(ownedInRegion(p.regionSlug, owned, catalog.stories)), 0) +
        singles.filter((s) => !packRegions.has(s.regionSlug)).reduce((sum, s) => sum + Math.round(s.price * 100), 0);
    const subtotal = subtotalCents / 100;
    const paid = Math.max(0, subtotal - (promo === PROMO_CODE ? Math.min(PROMO_DISCOUNT, subtotal) : 0));

    const wanted = [...new Set([...packs.flatMap((p) => p.storyIds), ...singles.map((s) => s.id)])];
    const storyIds = wanted.filter((id) => !owned.includes(id));
    await db.transaction(async (tx) => {
        if (storyIds.length) await tx.insert(userStories).values(storyIds.map((storyId) => ({ userId: user.id, storyId, source: "achat" as const }))).onConflictDoNothing();
        if (packs.length) await tx.insert(userBadges).values(packs.map((p) => ({ userId: user.id, regionSlug: p.regionSlug }))).onConflictDoNothing();
    });
    refresh();
    return { ok: true, storyIds, paid };
}
