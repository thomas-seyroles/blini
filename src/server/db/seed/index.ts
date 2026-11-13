import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { BookingStatus } from "../../../lib/enums";
import { estimatePrice, travelMinutes } from "../../../lib/journeys";
import { parisDate, todayIso } from "../../../lib/time";
import { shiftIso } from "../../../lib/trip";
import { roadKm } from "../../geo";
import { OAUTH_ACCOUNTS } from "../../oauth";
import * as t from "../schema";
import * as data from "./data";

// Jeu de données de test : vide la base puis la remplit, de façon reproductible (dates relatives au jour du seed)

const client = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
const db = drizzle(client, { casing: "snake_case" });

// Tirage pseudo-aléatoire déterministe
let state = 42;
const rand = () => {
    state = (state + 0x6d2b79f5) | 0;
    let x = Math.imul(state ^ (state >>> 15), 1 | state);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)];
const shuffle = <T>(list: T[]) => [...list].sort(() => rand() - 0.5);

const chunks = <T>(list: T[], size = 500) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size));
const email = (first: string, last: string) => `${first}.${last}`.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z.]/g, "") + "@mail.fr";
const HOUR = 3600_000;

const today = todayIso();
const cityBySlug = new Map(data.cities.map(([slug, name, regionSlug, lat, lng, spots]) => [slug, { slug, name, regionSlug, lat, lng, spots }]));

type JourneyRow = typeof t.journeys.$inferInsert & { id: string; departAt: Date; arriveAt: Date; seats: number; priceCents: number };
type BookingRow = typeof t.bookings.$inferInsert;

async function main() {
    await db.execute(sql`truncate users, regions, cities, items restart identity cascade`);

    // Référentiels

    await db.insert(t.regions).values(data.regions.map((r) => ({ ...r, packPriceCents: data.PACK_PRICE_CENTS })));
    await db.insert(t.cities).values([...cityBySlug.values()].map(({ slug, name, regionSlug, lat, lng }) => ({ slug, name, regionSlug, lat, lng })));
    await db.insert(t.items).values(data.items);

    // Comptes : personnes de test puis figurants

    const { extras } = data;
    const extra = (prefix: string, n: number, driver: boolean): data.Person[] =>
        Array.from({ length: n }, (_, i) => {
            const female = rand() < 0.5;
            return {
                key: `${prefix}-${i + 1}`,
                firstName: pick(female ? extras.femaleNames : extras.maleNames),
                lastName: pick(extras.lastNames),
                female,
                role: driver ? "conducteur" : "passager",
                blablacar: false,
                lunii: false,
                driver: driver
                    ? { car: pick(extras.cars), color: pick(extras.colors), bio: pick(extras.bios), rating: int(42, 50) / 10, reviews: int(3, 180), equipments: shuffle(["headset", "childSeat", "stories", "chat"] as const).slice(0, int(1, 4)) }
                    : undefined,
            };
        });
    const everyone = [...data.people, ...extra("conducteur", extras.drivers, true), ...extra("passager", extras.passengers, false)];

    const userRows = everyone.map((p, i) => ({
        id: randomUUID(),
        firstName: p.firstName,
        lastName: p.lastName,
        email: i < data.people.length ? email(p.firstName, p.lastName) : email(p.firstName, p.lastName).replace("@", `${i}@`),
        photo: OAUTH_ACCOUNTS.find((a) => a.email === email(p.firstName, p.lastName))?.photo ?? data.portrait(p.female, i),
        role: p.role,
        blablacarId: p.blablacar ? `bbc-${p.key}` : null,
        luniiId: p.lunii ? `lunii-${p.key}` : null,
        // Les avis du conducteur servent de proxy au nombre de trajets BlaBlaCar
        blablacarTrips: p.blablacar ? (p.driver?.reviews ?? ({ theo: 12, camille: 8 }[p.key] ?? 0)) : 0,
        rulesAcceptedAt: p.key === "camille" ? null : new Date(),
    }));
    await db.insert(t.users).values(userRows);
    const id = Object.fromEntries(everyone.map((p, i) => [p.key, userRows[i].id]));

    const drivers = everyone.filter((p) => p.driver);
    await db.insert(t.driverProfiles).values(
        drivers.map(({ key, female, driver: d }) => ({ userId: id[key], female, car: d!.car, color: d!.color, bio: d!.bio, rating: d!.rating, reviewsCount: d!.reviews, equipments: d!.equipments })),
    );

    // Avis récents laissés aux conducteurs
    const reviewers = everyone.filter((p) => !p.driver).map((p) => p.key);
    await db.insert(t.reviews).values(
        drivers.flatMap(({ key, driver: d }) =>
            shuffle(data.reviewTexts)
                .slice(0, 3)
                .map((text, i) => ({ driverId: id[key], authorId: id[pick(reviewers)], rating: Math.min(5, Math.max(3, Math.round(d!.rating + rand() - 0.7))), text, createdAt: new Date(Date.now() - (i + 1) * int(2, 9) * 24 * HOUR) })),
        ),
    );

    // Histoires

    await db.insert(t.stories).values(
        Object.entries(data.stories).flatMap(([regionSlug, list]) =>
            list.map(([title, author, ageLabel, durationSec], i) => ({
                id: `${regionSlug}-${i + 1}`,
                regionSlug,
                title,
                authorCredit: `D’après l’anecdote de ${author}`,
                luniiAuthor: data.luniiAuthors[(i + regionSlug.length) % data.luniiAuthors.length],
                ageLabel,
                durationSec,
                priceCents: data.STORY_PRICE_CENTS,
                publishedAt: new Date(Date.now() - int(10, 120) * 24 * HOUR),
            })),
        ),
    );

    // Trajets : les scénarios du compte Théo, puis des trajets générés sur J-30 / J+30

    const journeyRows: JourneyRow[] = [];
    const bookingRows: BookingRow[] = [];

    function journey(from: string, to: string, date: string, time: string, driver: string, certified = rand() < 0.65): JourneyRow {
        const a = cityBySlug.get(from)!;
        const b = cityBySlug.get(to)!;
        const km = roadKm(a, b);
        const departAt = parisDate(date, time);
        const [fromSpot, fromAddress] = pick(a.spots);
        const [toSpot, toAddress] = pick(b.spots);
        const row = {
            id: randomUUID(),
            driverId: id[driver],
            fromCity: from,
            fromSpot,
            fromAddress,
            toCity: to,
            toSpot,
            toAddress,
            departAt,
            arriveAt: new Date(departAt.getTime() + (travelMinutes(km) + 5 * int(0, 3)) * 60_000),
            km,
            priceCents: Math.max(8, estimatePrice(km) - 2 + int(0, 4)) * 100,
            seats: int(3, 4),
            certified,
        };
        journeyRows.push(row);
        return row;
    }

    function book(j: JourneyRow, passenger: string, seats: number, status: BookingStatus) {
        bookingRows.push({ journeyId: j.id, passengerId: id[passenger], seats, priceCents: j.priceCents * seats, status, createdAt: new Date(j.departAt.getTime() - int(2, 10) * 24 * HOUR) });
    }

    const day = (n: number) => shiftIso(today, n);

    // Passé de Théo : 5 trajets effectués et 1 annulé
    const theoTrips = {
        parisDijon: journey("paris", "dijon", day(-25), "08:30", "karim", true),
        dijonParis: journey("dijon", "paris", day(-24), "17:00", "sophie", true),
        parisLyon: journey("paris", "lyon", day(-14), "08:30", "julie", true),
        lyonParis: journey("lyon", "paris", day(-12), "18:00", "marc", true),
        strasbourgColmar: journey("strasbourg", "colmar", day(-6), "10:30", "etienne", true),
        lyonGrenoble: journey("lyon", "grenoble", day(-3), "09:15", "nadia", false),
    };
    for (const [key, j] of Object.entries(theoTrips)) book(j, "theo", 2, key === "lyonGrenoble" ? "annulee" : "acceptee");

    // À venir pour Théo : une place confirmée par Julie, une demande en attente chez Karim
    const nextParisLyon = journey("paris", "lyon", day(3), "08:30", "julie", true);
    nextParisLyon.seats = 4;
    book(nextParisLyon, "theo", 2, "acceptee");
    book(nextParisLyon, "lea", 1, "demande");
    book(journey("lyon", "marseille", day(10), "14:00", "karim", true), "theo", 2, "demande");

    // Côté conductrice : Julie a d'autres demandes à traiter
    const julieReturn = journey("lyon", "paris", day(5), "17:00", "julie", true);
    julieReturn.seats = 3;
    book(julieReturn, "ines", 2, "demande");
    book(julieReturn, "hugo", 1, "acceptee");

    // Côté Camille (persona : Nantaise, maman de Léo, déjà sur BlaBlaCar) : un trajet passé et un à venir avec Yann
    book(journey("nantes", "rennes", day(-9), "12:15", "yann", true), "camille", 1, "acceptee");
    const camilleNext = journey("nantes", "rennes", day(7), "09:15", "yann", true);
    book(camilleNext, "camille", 1, "demande");

    // Trajets générés : surtout des figurants, parfois un compte de test pour qu'il ait un historique
    const keys = (list: data.Person[], test: boolean) => list.filter((p) => (test ? !p.key.includes("-") : p.key.includes("-"))).map((p) => p.key);
    const testDrivers = keys(drivers, true);
    const extraDrivers = keys(drivers, false);
    const riders = everyone.filter((p) => !p.driver && p.key !== "theo" && p.key !== "camille");
    const testRiders = keys(riders, true);
    const extraRiders = keys(riders, false);
    const now = Date.now();
    // Liaisons : les explicites très desservies, puis des liaisons aléatoires entre grandes villes (hubs = data.HUBS)
    const hubs = new Set(data.HUBS);
    const explicit = new Set(data.routes.map(([a, b]) => [a, b].sort().join("|")));
    const pairs: { a: string; b: string; load: number }[] = [];
    const slugs = data.cities.map(([slug]) => slug);
    for (let i = 0; i < slugs.length; i++) {
        for (let k = i + 1; k < slugs.length; k++) {
            const [a, b] = [slugs[i], slugs[k]];
            const km = roadKm(cityBySlug.get(a)!, cityBySlug.get(b)!);
            const hubCount = Number(hubs.has(a)) + Number(hubs.has(b));
            const load = explicit.has([a, b].sort().join("|")) ? 3 : km < 60 || km > 750 ? 0 : hubCount === 2 ? (rand() < 0.8 ? 3 : 0) : hubCount === 1 ? (rand() < 0.6 ? 2 : 0) : km < 350 && rand() < 0.4 ? 1 : 0;
            if (load) pairs.push({ a, b, load });
        }
    }

    for (let d = -10; d <= 30; d++) {
        for (const { a, b, load } of pairs) {
            for (const [from, to] of [[a, b], [b, a]]) {
                const count = load === 3 ? int(2, 4) : load === 2 ? int(1, 2) : rand() < 0.6 ? 1 : 0;
                for (const time of shuffle(data.DEPARTURE_TIMES).slice(0, count).sort()) {
                    const j = journey(from, to, day(d), time, pick(rand() < 0.05 ? testDrivers : extraDrivers));
                    const past = j.departAt.getTime() < now;
                    let free = rand() < 0.15 ? j.seats : int(0, j.seats);
                    const crew = new Set([...(rand() < 0.08 ? [pick(testRiders)] : []), ...Array.from({ length: j.seats }, () => pick(extraRiders))]);
                    for (const p of crew) {
                        if (free <= 0) break;
                        const seats = Math.min(free, int(1, 2));
                        book(j, p, seats, past || rand() < 0.75 ? "acceptee" : "demande");
                        free -= seats;
                    }
                }
            }
        }
    }

    for (const part of chunks(journeyRows)) await db.insert(t.journeys).values(part);
    for (const part of chunks(bookingRows)) await db.insert(t.bookings).values(part);

    // Anecdotes, rattachées aux trajets passés de Théo quand c'est le cas

    const anecdoteJourney: Record<string, JourneyRow> = {
        "La boulangerie de Saulieu": theoTrips.parisDijon,
        "Le pont qui chantait sous la pluie": theoTrips.dijonParis,
        "Le fromager de la Croix-Rousse": theoTrips.parisLyon,
        "Le marché de Beaune": theoTrips.parisLyon,
        "Le clocher de Semur-en-Auxois": theoTrips.lyonParis,
        "Les cigognes de la gare de Colmar": theoTrips.strasbourgColmar,
    };

    for (const [author, title, place, regionSlug, status, validated, details, storyId] of data.anecdotes) {
        const j = anecdoteJourney[title];
        const createdAt = j ? new Date(j.departAt.getTime() + HOUR) : new Date(now - int(3, 40) * 24 * HOUR);
        const [row] = await db
            .insert(t.anecdotes)
            .values({ userId: id[author], journeyId: j?.id ?? null, regionSlug, title, place, details, status, audioSec: int(45, 180), createdAt, validatedAt: validated ? new Date(createdAt.getTime() + 4 * HOUR) : null })
            .returning({ id: t.anecdotes.id });
        if (storyId) {
            await db.update(t.stories).set({ anecdoteId: row.id }).where(eq(t.stories.id, storyId));
            await db.insert(t.userStories).values({ userId: id[author], storyId, source: "cadeau" });
        }
    }

    // Contributeurs : le compte du prénom crédité s'il existe, l'auteur de l'anecdote liée, parfois un figurant de plus
    const figurants = everyone.filter((p) => p.key.includes("-"));
    const contributorRows = Object.entries(data.stories).flatMap(([regionSlug, list]) =>
        list.flatMap(([, author], i) => {
            const storyId = `${regionSlug}-${i + 1}`;
            const first = author.split(",")[0].trim().toLowerCase();
            const keys = new Set([everyone.find((p) => p.firstName.toLowerCase() === first)?.key ?? pick(figurants).key]);
            const linked = data.anecdotes.find((a) => a[7] === storyId);
            if (linked) keys.add(linked[0]);
            if (rand() < 0.3) keys.add(pick(figurants).key);
            return [...keys].map((key) => ({ storyId, userId: id[key] }));
        }),
    );
    await db.insert(t.storyContributors).values(contributorRows);

    // Bibliothèques et collections

    const owned: [string, string[]][] = [
        ["theo", ["ile-de-france-1", "alsace-2"]],
        ["camille", ["pays-de-la-loire-1", "pays-de-la-loire-2", "pays-de-la-loire-3", "bretagne-1"]],
        ["lea", ["ile-de-france-2", "occitanie-1"]],
        ["julie", ["auvergne-rhone-alpes-1"]],
    ];
    await db.insert(t.userStories).values(owned.flatMap(([user, ids]) => ids.map((storyId) => ({ userId: id[user], storyId, source: "achat" as const }))));
    // Playlists de trajets à venir : histoires choisies et collections
    const playlists: [string, JourneyRow, ({ story: string } | { region: string })[]][] = [
        ["theo", nextParisLyon, [{ region: "ile-de-france" }, { story: "alsace-2" }]],
        ["camille", camilleNext, [{ region: "pays-de-la-loire" }, { story: "bretagne-1" }]],
        ["julie", julieReturn, [{ story: "auvergne-rhone-alpes-1" }]],
    ];
    for (const [user, j, entries] of playlists) {
        const [{ id: playlistId }] = await db.insert(t.playlists).values({ userId: id[user], journeyId: j.id }).returning({ id: t.playlists.id });
        await db.insert(t.playlistEntries).values(entries.map((e, position) => ({ playlistId, position, storyId: "story" in e ? e.story : null, regionSlug: "region" in e ? e.region : null })));
    }

    // Badges de région des comptes qui ont acheté une collection (visibles sur le profil conducteur)
    const badges: [string, string[]][] = [
        ["theo", ["ile-de-france"]],
        ["julie", ["ile-de-france", "auvergne-rhone-alpes"]],
        ["yann", ["bretagne"]],
        ["marc", ["alsace", "ile-de-france"]],
        ["zoe", ["occitanie", "provence-alpes-cote-d-azur"]],
    ];
    await db.insert(t.userBadges).values(badges.flatMap(([user, slugs]) => slugs.map((regionSlug) => ({ userId: id[user], regionSlug }))));

    await db.insert(t.userItems).values([{ userId: id.theo, itemId: "remise-trajet" }]);

    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(t.journeys);
    console.log(`Seed terminé : ${userRows.length} comptes, ${count} trajets, ${bookingRows.length} réservations.`);
    console.log("Connexion : annuaire OAuth fictif (BlaBlaCar : Thomas Seyroles, absent de la base donc compte vide à l’inscription. Lunii : Camille).");
}

main()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(() => client.end());
