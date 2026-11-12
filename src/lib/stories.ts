export type Region = { slug: string; name: string; cover: string | null };

export type Story = {
    id: string;
    title: string;
    regionSlug: string;
    author: string;
    age: string;
    durationSec: number;
    price: number;
};

export type Pack = { id: string; title: string; regionSlug: string; storyIds: string[]; price: number };

export const regions: Region[] = [
    { slug: "ile-de-france", name: "Île-de-France", cover: "/images/couvertures/ile-de-france.png" },
    { slug: "bretagne", name: "Bretagne", cover: "/images/couvertures/bretagne.png" },
    { slug: "provence-alpes-cote-d-azur", name: "Provence-Alpes-Côte d’Azur", cover: "/images/couvertures/provence.png" },
    { slug: "alsace", name: "Alsace", cover: "/images/couvertures/alsace.png" },
    { slug: "bourgogne-franche-comte", name: "Bourgogne-Franche-Comté", cover: null },
    { slug: "auvergne-rhone-alpes", name: "Auvergne-Rhône-Alpes", cover: null },
    { slug: "occitanie", name: "Occitanie", cover: null },
];

// [titre, auteur de l’anecdote, âge, durée en secondes]
const seeds: Record<string, [string, string, string, number][]> = {
    "ile-de-france": [
        ["Le fantôme du métro Arts-et-Métiers", "Karim, passager", "dès 4 ans", 480],
        ["La baguette qui voulait voir la tour Eiffel", "Léa, conductrice", "dès 3 ans", 420],
        ["Le canard du bassin de la Villette", "Tom, passager", "dès 5 ans", 540],
    ],
    bretagne: [
        ["Le phare qui avait peur du noir", "Soline, passagère", "dès 4 ans", 510],
        ["La crêpe géante de Locronan", "Yann, conducteur", "dès 3 ans", 390],
        ["Le korrigan du pont de Pont-Aven", "Maëlle, passagère", "dès 6 ans", 600],
    ],
    "provence-alpes-cote-d-azur": [
        ["La cigale de Manosque", "Camille, passagère", "dès 3 ans", 360],
        ["Le mistral qui chuchotait", "Hugo, passager", "dès 5 ans", 480],
        ["Le champ de lavande qui chantait", "Zoé, conductrice", "dès 4 ans", 450],
    ],
    alsace: [
        ["La cigogne qui perdait ses lunettes", "Margaux, passagère", "dès 4 ans", 420],
        ["Le sapin de Noël de Colmar", "Étienne, conducteur", "dès 3 ans", 330],
        ["Le bretzel magique", "Inès, passagère", "dès 5 ans", 500],
    ],
    "bourgogne-franche-comte": [
        ["La boulangerie de Saulieu", "Théo, passager", "dès 4 ans", 440],
        ["Le pont qui chantait sous la pluie", "Théo, passager", "dès 5 ans", 520],
        ["L’escargot gourmand de Dijon", "Sophie, conductrice", "dès 3 ans", 380],
    ],
    "auvergne-rhone-alpes": [
        ["Le volcan qui ronflait", "Julie, conductrice", "dès 4 ans", 470],
        ["La fée du lac d’Annecy", "Nadia, conductrice", "dès 5 ans", 530],
        ["Le tram qui rêvait de montagne", "Marc, conducteur", "dès 6 ans", 560],
    ],
    occitanie: [
        ["Le dragon du canal du Midi", "Clara, passagère", "dès 5 ans", 490],
        ["La cassolette qui parlait", "Bastien, passager", "dès 4 ans", 400],
        ["Le moulin de Carcassonne", "Lola, passagère", "dès 6 ans", 580],
    ],
};

export const stories: Story[] = Object.entries(seeds).flatMap(([regionSlug, list]) =>
    list.map(([title, author, age, durationSec], i) => ({
        id: `${regionSlug}-${i + 1}`,
        title,
        regionSlug,
        author: `D’après l’anecdote de ${author}`,
        age,
        durationSec,
        price: 1.99,
    })),
);

export const packs: Pack[] = regions.map((r) => ({
    id: `pack-${r.slug}`,
    title: `Pack ${r.name}`,
    regionSlug: r.slug,
    storyIds: stories.filter((s) => s.regionSlug === r.slug).map((s) => s.id),
    price: 4.9,
}));

export const storyById = (id: string) => stories.find((s) => s.id === id);
export const packById = (id: string) => packs.find((p) => p.id === id);
export const regionBySlug = (slug: string) => regions.find((r) => r.slug === slug);
export const storiesOfRegion = (slug: string) => stories.filter((s) => s.regionSlug === slug);

export const duration = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

export const minutes = (sec: number) => `${Math.round(sec / 60)} min`;
export const price = (n: number) => `${n.toFixed(2).replace(".", ",")} €`;
export const regionName = (slug: string) => regionBySlug(slug)?.name ?? slug;
export const packOfRegion = (slug: string) => packs.find((p) => p.regionSlug === slug);

export const synopsis = (s: Story) =>
    `Une histoire inventée par l’équipe d’auteurs Lunii à partir d’une anecdote vécue en ${regionName(s.regionSlug)}. ` +
    `${s.title} t’emmène sur la route pour ${minutes(s.durationSec)} d’écoute, avec des personnages et des lieux à reconnaître par la fenêtre.`;

// Régions traversées par un trajet (maquette : villes connues seulement)
const cityRegion: Record<string, string> = {
    Paris: "ile-de-france",
    Lyon: "auvergne-rhone-alpes",
    Marseille: "provence-alpes-cote-d-azur",
    Strasbourg: "alsace",
    Toulouse: "occitanie",
    Dijon: "bourgogne-franche-comte",
};
export const defaultRouteRegions = ["ile-de-france", "bourgogne-franche-comte", "auvergne-rhone-alpes"];

export function regionsOfRoute(from: string, to: string) {
    const parisLyon = [from, to].sort().join() === "Lyon,Paris";
    const list = [cityRegion[from], ...(parisLyon ? ["bourgogne-franche-comte"] : []), cityRegion[to]];
    const found = [...new Set(list.filter(Boolean))];
    return found.length ? found : defaultRouteRegions;
}
