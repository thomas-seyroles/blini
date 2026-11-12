export type Region = { slug: string; name: string; cover: string | null };

export type Contributor = { id: string; name: string; photo: string };

export type Story = {
    id: string;
    title: string;
    regionSlug: string;
    author: string;
    age: string;
    durationSec: number;
    price: number;
    luniiAuthor: string;
    contributors: Contributor[];
};

export type Pack = { id: string; title: string; regionSlug: string; storyIds: string[]; price: number };

// Collection complète : 30 histoires par région à 2,99 €, moins 30 % à l'achat global (les histoires sont ajoutées au fil du temps)
export const STORIES_PER_REGION = 30;
export const STORY_PRICE_CENTS = 299;
export const PACK_DISCOUNT_PERCENT = 30;

// Prix dynamique d'un pack : les histoires déjà possédées dans la région sont déduites avant la remise
export const packPriceCents = (owned: number) => Math.round(Math.max(0, STORIES_PER_REGION - owned) * STORY_PRICE_CENTS * (100 - PACK_DISCOUNT_PERCENT) / 100);
export const PACK_PRICE_CENTS = packPriceCents(0);
export const ownedInRegion = (regionSlug: string, ownedIds: string[], stories: Pick<Story, "id" | "regionSlug">[]) =>
    stories.filter((s) => s.regionSlug === regionSlug && ownedIds.includes(s.id)).length;
export const packPrice = (regionSlug: string, ownedIds: string[], stories: Story[]) => packPriceCents(ownedInRegion(regionSlug, ownedIds, stories)) / 100;
// Prix des histoires restantes sans la remise de pack
export const packFullPrice = (regionSlug: string, ownedIds: string[], stories: Story[]) => (Math.max(0, STORIES_PER_REGION - ownedInRegion(regionSlug, ownedIds, stories)) * STORY_PRICE_CENTS) / 100;

export const packId = (regionSlug: string) => `pack-${regionSlug}`;

export const duration = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
export const minutes = (sec: number) => `${Math.round(sec / 60)} min`;
export const price = (n: number) => `${n.toFixed(2).replace(".", ",")} €`;

export const synopsis = (s: Story, regionName: string) =>
    `Une histoire inventée par l’équipe d’auteurs Lunii à partir d’une anecdote vécue en ${regionName}. ` +
    `${s.title} t’emmène sur la route pour ${minutes(s.durationSec)} d’écoute, avec des personnages et des lieux à reconnaître par la fenêtre.`;

export type CartLine = { kind: "story" | "pack"; id: string };
