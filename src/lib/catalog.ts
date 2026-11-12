import type { Item } from "./items";
import type { Pack, Region, Story } from "./stories";

// Catalogue chargé depuis la base, et ses recherches par identifiant

export type Catalog = { regions: Region[]; stories: Story[]; packs: Pack[]; items: Item[] };

export function indexCatalog(c: Catalog) {
    const stories = new Map(c.stories.map((s) => [s.id, s]));
    const packs = new Map(c.packs.map((p) => [p.id, p]));
    const regions = new Map(c.regions.map((r) => [r.slug, r]));
    const items = new Map(c.items.map((i) => [i.id, i]));

    return {
        ...c,
        storyById: (id: string) => stories.get(id),
        packById: (id: string) => packs.get(id),
        itemById: (id: string) => items.get(id),
        regionBySlug: (slug: string) => regions.get(slug),
        regionName: (slug: string) => regions.get(slug)?.name ?? slug,
        storiesOfRegion: (slug: string) => c.stories.filter((s) => s.regionSlug === slug),
        packOfRegion: (slug: string) => c.packs.find((p) => p.regionSlug === slug),
    };
}

export type CatalogIndex = ReturnType<typeof indexCatalog>;
