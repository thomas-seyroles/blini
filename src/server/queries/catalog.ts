import "server-only";
import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { indexCatalog, type Catalog } from "@/lib/catalog";
import { DEFAULT_PHOTO } from "@/lib/journeys";
import { packId } from "@/lib/stories";
import { db } from "../db";
import { cities, items, regions, storyContributors, stories, users } from "../db/schema";

// Catalogue commun à tous les comptes : régions, histoires, packs et items, mis en cache (tag « catalog »)
export async function getCatalog(): Promise<Catalog> {
    "use cache";
    cacheLife("minutes");
    cacheTag("catalog");
    const [regionRows, storyRows, itemRows, contributorRows] = await Promise.all([
        db.select().from(regions).orderBy(asc(regions.name)),
        db.select().from(stories).orderBy(asc(stories.id)),
        db.select().from(items).orderBy(asc(items.costPoints)),
        db
            .select({ storyId: storyContributors.storyId, id: users.id, firstName: users.firstName, lastName: users.lastName, photo: users.photo })
            .from(storyContributors)
            .innerJoin(users, eq(users.id, storyContributors.userId))
            .orderBy(asc(users.firstName)),
    ]);
    return {
        regions: regionRows.map(({ slug, name, cover }) => ({ slug, name, cover })),
        stories: storyRows.map((s) => ({
            id: s.id,
            title: s.title,
            regionSlug: s.regionSlug,
            author: s.authorCredit,
            age: s.ageLabel,
            durationSec: s.durationSec,
            price: s.priceCents / 100,
            luniiAuthor: s.luniiAuthor,
            contributors: contributorRows.filter((c) => c.storyId === s.id).map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName.charAt(0)}.`, photo: c.photo ?? DEFAULT_PHOTO })),
        })),
        packs: regionRows.map((r) => ({
            id: packId(r.slug),
            title: `Pack ${r.name}`,
            regionSlug: r.slug,
            storyIds: storyRows.filter((s) => s.regionSlug === r.slug).map((s) => s.id),
            price: r.packPriceCents / 100,
        })),
        items: itemRows.map(({ costPoints, ...i }) => ({ ...i, cost: costPoints })),
    };
}

export const getCatalogIndex = cache(async () => indexCatalog(await getCatalog()));

export const getCities = cache(() => db.select().from(cities));
