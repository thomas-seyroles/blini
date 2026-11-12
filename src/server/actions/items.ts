"use server";

import { and, eq, isNull, notInArray, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { requireUser } from "../auth";
import { db } from "../db";
import { items, pointEvents, stories, userItems, userStories } from "../db/schema";

// Échange de points contre un item. L'histoire mystère ajoute en plus une histoire offerte.
export async function exchangeItem(itemId: string): Promise<{ ok?: boolean; error?: string }> {
    const user = await requireUser();
    const [item] = await db.select().from(items).where(eq(items.id, String(itemId)));
    if (!item) return { error: "Cet item n’existe pas." };

    return db.transaction(async (tx) => {
        const [{ balance }] = await tx.select({ balance: sql<number>`coalesce(sum(${pointEvents.points}), 0)::int` }).from(pointEvents).where(eq(pointEvents.userId, user.id));
        if (balance < item.costPoints) return { error: "Pas assez de points." };

        // Un bon de réduction se rachète une fois consommé, les autres items ne s'achètent qu'une fois
        const [existing] = await tx
            .select({ id: userItems.id })
            .from(userItems)
            .where(and(eq(userItems.userId, user.id), eq(userItems.itemId, item.id), item.category === "reduction" ? isNull(userItems.usedAt) : undefined))
            .limit(1);
        if (existing) return { error: item.category === "reduction" ? "Tu as déjà une remise disponible." : "Tu as déjà cet item." };
        await tx.insert(userItems).values({ userId: user.id, itemId: item.id });

        if (item.category === "histoire") {
            const owned = tx.select({ id: userStories.storyId }).from(userStories).where(eq(userStories.userId, user.id));
            const [gift] = await tx.select({ id: stories.id }).from(stories).where(notInArray(stories.id, owned)).orderBy(sql`random()`).limit(1);
            if (gift) await tx.insert(userStories).values({ userId: user.id, storyId: gift.id, source: "cadeau" });
        }
        refresh();
        return { ok: true };
    });
}
