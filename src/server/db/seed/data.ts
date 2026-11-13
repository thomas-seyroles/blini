import type { Equipment, ItemCategory, Role, Tint } from "../../../lib/enums";

export const regions = [
    { slug: "ile-de-france", name: "Île-de-France", cover: "/images/couvertures/ile-de-france.webp" },
    { slug: "bretagne", name: "Bretagne", cover: "/images/couvertures/bretagne.webp" },
    { slug: "provence-alpes-cote-d-azur", name: "Provence-Alpes-Côte d’Azur", cover: "/images/couvertures/provence.webp" },
    { slug: "alsace", name: "Alsace", cover: "/images/couvertures/alsace.webp" },
    { slug: "bourgogne-franche-comte", name: "Bourgogne-Franche-Comté", cover: null },
    { slug: "auvergne-rhone-alpes", name: "Auvergne-Rhône-Alpes", cover: null },
    { slug: "occitanie", name: "Occitanie", cover: null },
    { slug: "normandie", name: "Normandie", cover: null },
    { slug: "hauts-de-france", name: "Hauts-de-France", cover: null },
    { slug: "pays-de-la-loire", name: "Pays de la Loire", cover: null },
    { slug: "nouvelle-aquitaine", name: "Nouvelle-Aquitaine", cover: null },
    { slug: "centre-val-de-loire", name: "Centre-Val de Loire", cover: null },
    { slug: "grand-est", name: "Grand Est", cover: null },
];

export { PACK_PRICE_CENTS, STORY_PRICE_CENTS } from "../../../lib/stories";

// [slug, nom, région, latitude, longitude, points de rendez-vous [nom, adresse]]
const mainCities: [string, string, string, number, number, [string, string][]][] = [
    ["paris", "Paris", "ile-de-france", 48.8566, 2.3522, [["Bercy", "Parking du parc de Bercy, 75012"], ["Porte d’Italie", "Avenue d’Italie, 75013"], ["Gare de Lyon", "Place Louis-Armand, 75012"]]],
    ["rennes", "Rennes", "bretagne", 48.1173, -1.6778, [["Gare", "Place de la gare, 35000"], ["Villejean", "Avenue Winston Churchill, 35000"]]],
    ["brest", "Brest", "bretagne", 48.3904, -4.4861, [["Gare", "Place du 19e RI, 29200"], ["Port de commerce", "Quai de la douane, 29200"]]],
    ["marseille", "Marseille", "provence-alpes-cote-d-azur", 43.2965, 5.3698, [["Saint-Charles", "Square Narvik, 13001"], ["Vieux-Port", "Quai des Belges, 13001"]]],
    ["nice", "Nice", "provence-alpes-cote-d-azur", 43.7102, 7.262, [["Gare Thiers", "Avenue Thiers, 06000"], ["Port", "Quai Lunel, 06300"]]],
    ["strasbourg", "Strasbourg", "alsace", 48.5734, 7.7521, [["Gare", "Place de la gare, 67000"], ["Étoile", "Place de l’Étoile, 67000"]]],
    ["colmar", "Colmar", "alsace", 48.0794, 7.3585, [["Gare", "Place de la gare, 68000"], ["Rapp", "Place Rapp, 68000"]]],
    ["dijon", "Dijon", "bourgogne-franche-comte", 47.322, 5.0415, [["Gare", "Rue du docteur Remy, 21000"], ["Toison d’Or", "Route de Langres, 21000"]]],
    ["besancon", "Besançon", "bourgogne-franche-comte", 47.2378, 6.0241, [["Viotte", "Avenue de la paix, 25000"], ["Chamars", "Promenade Chamars, 25000"]]],
    ["lyon", "Lyon", "auvergne-rhone-alpes", 45.764, 4.8357, [["Part-Dieu", "Rue de la Villette, 69003"], ["Perrache", "Cours de Verdun Rambaud, 69002"]]],
    ["grenoble", "Grenoble", "auvergne-rhone-alpes", 45.1885, 5.7245, [["Gare", "Place de la gare, 38000"], ["Chavant", "Place Gustave Rivet, 38000"]]],
    ["clermont-ferrand", "Clermont-Ferrand", "auvergne-rhone-alpes", 45.7772, 3.087, [["Gare", "Avenue de l’Union soviétique, 63000"], ["Jaude", "Place de Jaude, 63000"]]],
    ["toulouse", "Toulouse", "occitanie", 43.6047, 1.4442, [["Matabiau", "Boulevard Pierre Semard, 31500"], ["Capitole", "Place du Capitole, 31000"]]],
    ["montpellier", "Montpellier", "occitanie", 43.6108, 3.8767, [["Saint-Roch", "Place Auguste Gibert, 34000"], ["Odysseum", "Place de Lisbonne, 34000"]]],
];

// [nom, région, latitude, longitude, code postal] : points de rendez-vous générés
const moreCities: [string, string, number, number, string][] = [
    ["Bordeaux", "nouvelle-aquitaine", 44.8378, -0.5792, "33000"],
    ["Lille", "hauts-de-france", 50.6292, 3.0573, "59000"],
    ["Nantes", "pays-de-la-loire", 47.2184, -1.5536, "44000"],
    ["Toulon", "provence-alpes-cote-d-azur", 43.1242, 5.928, "83000"],
    ["Saint-Étienne", "auvergne-rhone-alpes", 45.4397, 4.3872, "42000"],
    ["Le Havre", "normandie", 49.4944, 0.1079, "76600"],
    ["Reims", "grand-est", 49.2583, 4.0317, "51100"],
    ["Rouen", "normandie", 49.4432, 1.0993, "76000"],
    ["Nancy", "grand-est", 48.6921, 6.1844, "54000"],
    ["Metz", "grand-est", 49.1193, 6.1757, "57000"],
    ["Angers", "pays-de-la-loire", 47.4784, -0.5632, "49000"],
    ["Le Mans", "pays-de-la-loire", 48.0061, 0.1996, "72000"],
    ["Tours", "centre-val-de-loire", 47.3941, 0.6848, "37000"],
    ["Orléans", "centre-val-de-loire", 47.9029, 1.9093, "45000"],
    ["Poitiers", "nouvelle-aquitaine", 46.5802, 0.3404, "86000"],
    ["Limoges", "nouvelle-aquitaine", 45.8336, 1.2611, "87000"],
    ["La Rochelle", "nouvelle-aquitaine", 46.1603, -1.1511, "17000"],
    ["Caen", "normandie", 49.1829, -0.3707, "14000"],
    ["Amiens", "hauts-de-france", 49.8941, 2.2958, "80000"],
    ["Perpignan", "occitanie", 42.6887, 2.8948, "66000"],
    ["Nîmes", "occitanie", 43.8367, 4.3601, "30000"],
    ["Béziers", "occitanie", 43.3441, 3.2158, "34500"],
    ["Avignon", "provence-alpes-cote-d-azur", 43.9493, 4.8055, "84000"],
    ["Aix-en-Provence", "provence-alpes-cote-d-azur", 43.5297, 5.4474, "13100"],
    ["Cannes", "provence-alpes-cote-d-azur", 43.5528, 7.0174, "06400"],
    ["Mulhouse", "alsace", 47.7508, 7.3359, "68100"],
    ["Annecy", "auvergne-rhone-alpes", 45.8992, 6.1294, "74000"],
    ["Chambéry", "auvergne-rhone-alpes", 45.5646, 5.9178, "73000"],
    ["Valence", "auvergne-rhone-alpes", 44.9334, 4.8924, "26000"],
    ["Pau", "nouvelle-aquitaine", 43.2951, -0.3708, "64000"],
    ["Bayonne", "nouvelle-aquitaine", 43.4929, -1.4748, "64100"],
    ["Quimper", "bretagne", 47.996, -4.1024, "29000"],
    ["Lorient", "bretagne", 47.7482, -3.3702, "56100"],
    ["Vannes", "bretagne", 47.6582, -2.7608, "56000"],
    ["Saint-Malo", "bretagne", 48.6493, -2.0257, "35400"],
    ["Saint-Brieuc", "bretagne", 48.5136, -2.7603, "22000"],
    ["Troyes", "grand-est", 48.2973, 4.0744, "10000"],
    ["Bourges", "centre-val-de-loire", 47.081, 2.3988, "18000"],
    ["Dunkerque", "hauts-de-france", 51.0344, 2.3768, "59140"],
    ["Calais", "hauts-de-france", 50.9513, 1.8587, "62100"],
];

const slugOf = (name: string) => name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

// Villes les plus desservies par les trajets générés
export const HUBS = ["paris", "marseille", "lyon", "toulouse", "nice", "nantes", "montpellier", "strasbourg", "bordeaux", "lille", "rennes", "grenoble"];

export const cities: [string, string, string, number, number, [string, string][]][] = [
    ...mainCities,
    ...moreCities.map(([name, region, lat, lng, cp]): (typeof mainCities)[number] => [slugOf(name), name, region, lat, lng, [["Gare", `Parvis de la gare, ${cp}`], ["Centre-ville", `Place principale, ${cp}`]]]),
];

// Liaisons toujours très desservies (dans les deux sens), en plus des liaisons aléatoires générées entre grandes villes
export const routes: [string, string][] = [
    ["paris", "lyon"],
    ["paris", "rennes"],
    ["paris", "strasbourg"],
    ["paris", "dijon"],
    ["paris", "toulouse"],
    ["lyon", "marseille"],
    ["lyon", "dijon"],
    ["lyon", "grenoble"],
    ["lyon", "clermont-ferrand"],
    ["marseille", "nice"],
    ["marseille", "montpellier"],
    ["toulouse", "montpellier"],
    ["strasbourg", "colmar"],
    ["rennes", "brest"],
    ["dijon", "besancon"],
];

export const DEPARTURE_TIMES = ["06:30", "07:45", "08:30", "09:15", "10:30", "12:15", "14:00", "16:30", "18:00", "19:15"];

export type Person = {
    key: string;
    firstName: string;
    lastName: string;
    female: boolean;
    role: Role;
    blablacar: boolean;
    lunii: boolean;
    driver?: { car: string; color: string; bio: string; rating: number; reviews: number; equipments: Equipment[] };
};

// Portraits de public/images/pdp : 24 par genre
export const portrait = (female: boolean, n: number) => `/images/pdp/${female ? "femme" : "homme"}-${(n % 24) + 1}.webp`;

export const people: Person[] = [
    // Comptes principaux de test
    { key: "theo", firstName: "Théo", lastName: "Martin", female: false, role: "passager", blablacar: true, lunii: false },
    { key: "camille", firstName: "Camille", lastName: "Durand", female: true, role: "passager", blablacar: true, lunii: true },

    // Conducteurs
    { key: "julie", firstName: "Julie", lastName: "Bernard", female: true, role: "conducteur", blablacar: true, lunii: false, driver: { car: "Peugeot 308", color: "bleue", rating: 4.9, reviews: 128, bio: "Je fais Paris-Lyon toutes les semaines. Les enfants adorent le casque Lunii, moi j’adore les anecdotes des régions traversées.", equipments: ["headset", "childSeat", "stories", "chat"] } },
    { key: "karim", firstName: "Karim", lastName: "Haddad", female: false, role: "conducteur", blablacar: true, lunii: false, driver: { car: "Renault Scénic", color: "grise", rating: 4.8, reviews: 64, bio: "Conduite tranquille, musique douce et histoires pour les petits. Je prête le casque avec plaisir.", equipments: ["headset", "stories"] } },
    { key: "sophie", firstName: "Sophie", lastName: "Leroy", female: true, role: "conducteur", blablacar: true, lunii: false, driver: { car: "Citroën C4", color: "blanche", rating: 4.7, reviews: 41, bio: "Je pars tôt et je roule détendue. Siège enfant disponible sur demande.", equipments: ["childSeat", "chat"] } },
    { key: "marc", firstName: "Marc", lastName: "Petit", female: false, role: "conducteur", blablacar: true, lunii: false, driver: { car: "Tesla Model 3", color: "noire", rating: 4.9, reviews: 210, bio: "Trajets silencieux ou bavards, au choix. Voiture électrique, recharge pendant la pause.", equipments: ["headset", "chat"] } },
    { key: "nadia", firstName: "Nadia", lastName: "Benali", female: true, role: "conducteur", blablacar: true, lunii: false, driver: { car: "Renault Clio", color: "rouge", rating: 4.6, reviews: 22, bio: "Je rentre à Paris tous les dimanches soir. Ambiance calme, arrêt café possible.", equipments: ["childSeat"] } },
    { key: "yann", firstName: "Yann", lastName: "Le Gall", female: false, role: "conducteur", blablacar: true, lunii: false, driver: { car: "Dacia Jogger", color: "verte", rating: 4.8, reviews: 57, bio: "Breton pur beurre, je connais une légende pour chaque kilomètre entre Rennes et Brest.", equipments: ["headset", "childSeat", "stories"] } },
    { key: "zoe", firstName: "Zoé", lastName: "Garcia", female: true, role: "conducteur", blablacar: false, lunii: true, driver: { car: "Toyota Yaris", color: "blanche", rating: 4.9, reviews: 89, bio: "Entre Toulouse et la Méditerranée, avec une playlist d’histoires pour les enfants.", equipments: ["headset", "stories", "chat"] } },
    { key: "etienne", firstName: "Étienne", lastName: "Muller", female: false, role: "conducteur", blablacar: true, lunii: false, driver: { car: "Volkswagen Touran", color: "grise", rating: 4.7, reviews: 35, bio: "Strasbourg, Colmar et retour. Bretzels offerts aux petits passagers.", equipments: ["childSeat", "chat"] } },

    // Passagers
    { key: "lea", firstName: "Léa", lastName: "Moreau", female: true, role: "passager", blablacar: true, lunii: false },
    { key: "tom", firstName: "Tom", lastName: "Girard", female: false, role: "passager", blablacar: true, lunii: false },
    { key: "ines", firstName: "Inès", lastName: "Fontaine", female: true, role: "passager", blablacar: false, lunii: true },
    { key: "hugo", firstName: "Hugo", lastName: "Lambert", female: false, role: "passager", blablacar: true, lunii: false },
    { key: "clara", firstName: "Clara", lastName: "Roux", female: true, role: "passager", blablacar: false, lunii: true },
    { key: "bastien", firstName: "Bastien", lastName: "Faure", female: false, role: "passager", blablacar: true, lunii: false },
    { key: "lola", firstName: "Lola", lastName: "Mercier", female: true, role: "passager", blablacar: true, lunii: false },
    { key: "margaux", firstName: "Margaux", lastName: "Blanc", female: true, role: "passager", blablacar: false, lunii: true },
    { key: "soline", firstName: "Soline", lastName: "Kerbrat", female: true, role: "passager", blablacar: true, lunii: false },
    { key: "maelle", firstName: "Maëlle", lastName: "Riou", female: true, role: "passager", blablacar: false, lunii: true },
];

// Figurants : conducteurs et passagers des trajets générés, sans compte BlaBlaCar ni Lunii lié
export const extras = {
    drivers: 160,
    passengers: 300,
    femaleNames: ["Chloé", "Emma", "Jade", "Manon", "Alice", "Lina", "Rose", "Anna", "Louise", "Mila", "Sarah", "Juliette", "Romane", "Agathe", "Elsa", "Léna", "Camille", "Inaya", "Zoé", "Eva"],
    maleNames: ["Antoine", "Lucas", "Nathan", "Louis", "Arthur", "Jules", "Gabriel", "Raphaël", "Paul", "Adam", "Victor", "Noah", "Ethan", "Sacha", "Maxime", "Hugo", "Léo", "Tom", "Enzo", "Baptiste"],
    lastNames: ["Dubois", "Robert", "Richard", "Simon", "Laurent", "Michel", "Garnier", "Rousseau", "Vincent", "Chevalier", "Fournier", "Morel", "Girard", "André", "Lefèvre", "Mercier", "Dupont", "Bonnet", "François", "Martinez"],
    cars: ["Peugeot 208", "Renault Mégane", "Citroën C3", "Skoda Octavia", "Volkswagen Golf", "Toyota Corolla", "Kia Ceed", "Ford Focus", "Renault Zoé", "Peugeot 5008"],
    colors: ["blanche", "grise", "noire", "bleue", "rouge", "verte"],
    bios: [
        "Trajets réguliers, conduite souple et bonne humeur.",
        "J’aime discuter, mais je respecte aussi les siestes.",
        "Voiture spacieuse, de la place pour les bagages.",
        "Pauses régulières, idéal pour voyager avec des enfants.",
        "Musique douce et histoires Lunii pour les plus jeunes.",
    ],
};

export const reviewTexts = [
    "Trajet très agréable, les enfants ont adoré les histoires de la route.",
    "Ponctuel, voiture propre et conduite douce. Je recommande.",
    "On a même appris une anecdote sur la région, super idée !",
    "Très bon contact, le casque Lunii a occupé les petits tout le trajet.",
    "Conduite rassurante et pauses bien pensées.",
    "Ambiance détendue, on a raconté nos souvenirs de vacances.",
];

// [titre, auteur de l'anecdote, âge, durée en secondes] par région
// Auteurs de l'équipe Lunii qui écrivent les histoires
export const luniiAuthors = ["Claire Fontaine", "Mathieu Aubry", "Sarah Lemoine", "Julien Roux", "Inès Marchand"];

export const stories: Record<string, [string, string, string, number][]> = {
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
    normandie: [
        ["Le phare qui comptait les vagues", "Léa, conductrice", "dès 4 ans", 450],
        ["La vache qui voulait voir la mer", "Tom, passager", "dès 3 ans", 380],
        ["Le biscuit magique de Rouen", "Inès, passagère", "dès 5 ans", 500],
    ],
    "hauts-de-france": [
        ["Le beffroi qui chantait à midi", "Hugo, passager", "dès 4 ans", 430],
        ["La frite géante de Lille", "Clara, passagère", "dès 3 ans", 360],
        ["Le mouton de la baie de Somme", "Bastien, passager", "dès 5 ans", 480],
    ],
    "pays-de-la-loire": [
        ["L’éléphant qui traversait la Loire", "Lola, passagère", "dès 4 ans", 470],
        ["Le château endormi d’Angers", "Margaux, passagère", "dès 5 ans", 520],
        ["La sardine voyageuse de Nantes", "Soline, passagère", "dès 3 ans", 390],
    ],
    "nouvelle-aquitaine": [
        ["Le phare de Cordouan et la mouette", "Maëlle, passagère", "dès 4 ans", 440],
        ["Le canelé qui roulait vers Bordeaux", "Léa, conductrice", "dès 3 ans", 370],
        ["La dune qui avançait doucement", "Tom, passager", "dès 6 ans", 560],
    ],
    "centre-val-de-loire": [
        ["Le fantôme du château de Chenonceau", "Inès, passagère", "dès 5 ans", 510],
        ["Le hérisson de la forêt d’Orléans", "Hugo, passager", "dès 3 ans", 350],
        ["La salamandre de Blois", "Clara, passagère", "dès 4 ans", 420],
    ],
    "grand-est": [
        ["La mirabelle qui voulait grandir", "Bastien, passager", "dès 3 ans", 360],
        ["Le dragon de la cathédrale de Reims", "Lola, passagère", "dès 5 ans", 530],
        ["La bulle de champagne curieuse", "Margaux, passagère", "dès 6 ans", 570],
    ],
    occitanie: [
        ["Le dragon du canal du Midi", "Clara, passagère", "dès 5 ans", 490],
        ["La cassolette qui parlait", "Bastien, passager", "dès 4 ans", 400],
        ["Le moulin de Carcassonne", "Lola, passagère", "dès 6 ans", 580],
    ],
};

export const items: { id: string; title: string; description: string; costPoints: number; image: string; category: ItemCategory; tint: Tint }[] = [
    { id: "remise-trajet", title: "Remise de 5 € sur un trajet", description: "Un bon de réduction de 5 € valable sur ta prochaine réservation de trajet certifié Bluni.", costPoints: 200, image: "/images/mascottes/voiture.webp", category: "reduction", tint: "turquoise" },
    { id: "collection-bluni", title: "1 collection Bluni offerte", description: "Une collection d’histoires régionales Bluni offerte et ajoutée à ta bibliothèque.", costPoints: 1000, image: "/images/items/collection.webp", category: "histoire", tint: "jaune" },
    { id: "conteuse-bluni", title: "1 conteuse édition Bluni offerte", description: "La conteuse Lunii aux couleurs de Bluni, offerte, pour écouter les histoires du trajet.", costPoints: 4000, image: "/images/items/conteuse.webp", category: "objet", tint: "bleu" },
];

// Anecdotes de test : [auteur, titre, lieu, région, statut, validée, détails, histoire publiée qui en est tirée]
export const anecdotes: [string, string, string, string, number, boolean, string, string | null][] = [
    ["theo", "La boulangerie de Saulieu", "Saulieu · Bourgogne-Franche-Comté", "bourgogne-franche-comte", 4, true, "Une boulangère qui cuit un pain en forme de bœuf charolais pour chaque enfant de passage.", "bourgogne-franche-comte-1"],
    ["theo", "Le pont qui chantait sous la pluie", "Côte-d’Or · Bourgogne-Franche-Comté", "bourgogne-franche-comte", 4, true, "Un pont de pierre qui sonne comme une flûte quand il pleut.", "bourgogne-franche-comte-2"],
    ["theo", "Le fromager de la Croix-Rousse", "Lyon · Auvergne-Rhône-Alpes", "auvergne-rhone-alpes", 3, true, "", null],
    ["theo", "Les cigognes de la gare de Colmar", "Colmar · Alsace", "alsace", 2, true, "Un couple de cigognes qui niche chaque printemps sur le toit de la gare.", null],
    ["theo", "Le marché de Beaune", "Beaune · Bourgogne-Franche-Comté", "bourgogne-franche-comte", 1, true, "", null],
    ["theo", "Le clocher de Semur-en-Auxois", "Semur-en-Auxois · Bourgogne-Franche-Comté", "bourgogne-franche-comte", 0, false, "", null],
    ["camille", "Le carrousel des mondes marins", "Nantes · Pays de la Loire", "pays-de-la-loire", 1, true, "Un manège géant où Léo a chevauché un calmar, à deux pas de l’éléphant des Machines de l’île.", null],
    ["camille", "La fée du passage Pommeraye", "Nantes · Pays de la Loire", "pays-de-la-loire", 0, false, "", null],
    ["lea", "Le chat de la tour Eiffel", "Paris · Île-de-France", "ile-de-france", 2, true, "", null],
    ["yann", "La légende du phare du Créac’h", "Ouessant · Bretagne", "bretagne", 3, true, "", null],
];
