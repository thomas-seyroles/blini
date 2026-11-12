import { sql } from "drizzle-orm";
import { boolean, check, customType, index, integer, jsonb, pgEnum, pgTable, pgView, primaryKey, real, smallint, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { BOOKING_STATUSES, ITEM_CATEGORIES, ROLES, STORY_SOURCES, TINTS, type Equipment, type Settings } from "../../lib/enums";
import { POINTS } from "../../lib/points";

const bytea = customType<{ data: Buffer }>({ dataType: () => "bytea" });
const at = () => timestamp({ withTimezone: true });

// Énumérations

export const role = pgEnum("role", ROLES);
export const bookingStatus = pgEnum("booking_status", BOOKING_STATUSES);
export const itemCategory = pgEnum("item_category", ITEM_CATEGORIES);
export const tint = pgEnum("tint", TINTS);
export const storySource = pgEnum("story_source", STORY_SOURCES);

// Utilisateurs

export const users = pgTable("users", {
    id: uuid().primaryKey().defaultRandom(),
    firstName: text().notNull(),
    lastName: text().notNull(),
    email: text().notNull().unique(),
    photo: text(),
    role: role().notNull().default("passager"),
    blablacarId: text().unique(),
    luniiId: text().unique(),
    rulesAcceptedAt: at(),
    blablacarTrips: integer().notNull().default(0),
    settings: jsonb().$type<Settings>().notNull().default({}),
    createdAt: at().notNull().defaultNow(),
});

export const driverProfiles = pgTable("driver_profiles", {
    userId: uuid().primaryKey().references(() => users.id, { onDelete: "cascade" }),
    female: boolean().notNull(),
    car: text().notNull(),
    color: text().notNull(),
    bio: text().notNull(),
    rating: real().notNull(),
    reviewsCount: integer().notNull(),
    equipments: text().array().$type<Equipment[]>().notNull().default(sql`'{}'`),
});

// Package Lunii réclamé par un conducteur vérifié : une commande par compte
export const packageOrders = pgTable("package_orders", {
    userId: uuid().primaryKey().references(() => users.id, { onDelete: "cascade" }),
    recipient: text().notNull(),
    street: text().notNull(),
    postalCode: text().notNull(),
    city: text().notNull(),
    conteuse: boolean().notNull(),
    totalCents: integer().notNull(),
    createdAt: at().notNull().defaultNow(),
});

export const reviews = pgTable(
    "reviews",
    {
        id: uuid().primaryKey().defaultRandom(),
        driverId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
        authorId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
        rating: smallint().notNull().default(5),
        text: text().notNull(),
        createdAt: at().notNull().defaultNow(),
    },
    (t) => [index().on(t.driverId)],
);

// Géographie

export const regions = pgTable("regions", {
    slug: text().primaryKey(),
    name: text().notNull(),
    cover: text(),
    packPriceCents: integer().notNull(),
});

export const cities = pgTable("cities", {
    slug: text().primaryKey(),
    name: text().notNull(),
    regionSlug: text().notNull().references(() => regions.slug),
    lat: real().notNull(),
    lng: real().notNull(),
});

// Trajets et réservations

export const journeys = pgTable(
    "journeys",
    {
        id: uuid().primaryKey().defaultRandom(),
        driverId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
        fromCity: text().notNull().references(() => cities.slug),
        fromSpot: text().notNull(),
        fromAddress: text().notNull(),
        toCity: text().notNull().references(() => cities.slug),
        toSpot: text().notNull(),
        toAddress: text().notNull(),
        departAt: at().notNull(),
        arriveAt: at().notNull(),
        km: integer().notNull(),
        priceCents: integer().notNull(),
        seats: integer().notNull(),
        certified: boolean().notNull(),
        cancelledAt: at(),
        createdAt: at().notNull().defaultNow(),
    },
    (t) => [index().on(t.fromCity, t.toCity, t.departAt), index().on(t.driverId)],
);

export const bookings = pgTable(
    "bookings",
    {
        id: uuid().primaryKey().defaultRandom(),
        journeyId: uuid().notNull().references(() => journeys.id, { onDelete: "cascade" }),
        passengerId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
        seats: integer().notNull(),
        priceCents: integer().notNull(),
        status: bookingStatus().notNull().default("demande"),
        createdAt: at().notNull().defaultNow(),
    },
    (t) => [unique().on(t.journeyId, t.passengerId), index().on(t.passengerId)],
);

// Anecdotes et histoires

export const anecdotes = pgTable(
    "anecdotes",
    {
        id: uuid().primaryKey().defaultRandom(),
        userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
        journeyId: uuid().references(() => journeys.id, { onDelete: "set null" }),
        regionSlug: text().references(() => regions.slug),
        title: text().notNull(),
        place: text().notNull(),
        details: text().notNull().default(""),
        audioSec: integer().notNull(),
        audio: bytea(),
        audioType: text(),
        photo: bytea(),
        status: smallint().notNull().default(0),
        validatedAt: at(),
        createdAt: at().notNull().defaultNow(),
    },
    (t) => [index().on(t.userId)],
);

export const stories = pgTable("stories", {
    id: text().primaryKey(),
    regionSlug: text().notNull().references(() => regions.slug),
    anecdoteId: uuid().references(() => anecdotes.id, { onDelete: "set null" }),
    title: text().notNull(),
    authorCredit: text().notNull(),
    luniiAuthor: text().notNull().default("Équipe d’auteurs Lunii"),
    ageLabel: text().notNull(),
    durationSec: integer().notNull(),
    priceCents: integer().notNull(),
    publishedAt: at().notNull().defaultNow(),
});

// Contributeurs : les comptes dont une anecdote retenue a inspiré l'histoire
export const storyContributors = pgTable(
    "story_contributors",
    {
        storyId: text().notNull().references(() => stories.id, { onDelete: "cascade" }),
        userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    },
    (t) => [primaryKey({ columns: [t.storyId, t.userId] }), index().on(t.userId)],
);

export const userStories = pgTable(
    "user_stories",
    {
        userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
        storyId: text().notNull().references(() => stories.id, { onDelete: "cascade" }),
        source: storySource().notNull(),
        createdAt: at().notNull().defaultNow(),
    },
    (t) => [primaryKey({ columns: [t.userId, t.storyId] })],
);

// Playlists : histoires préparées pour un trajet. Une entrée est soit une histoire choisie, soit une collection (région) dont les histoires possédées sont lues à la volée.

export const playlists = pgTable(
    "playlists",
    {
        id: uuid().primaryKey().defaultRandom(),
        userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
        journeyId: uuid().notNull().references(() => journeys.id, { onDelete: "cascade" }),
        createdAt: at().notNull().defaultNow(),
    },
    (t) => [unique().on(t.userId, t.journeyId)],
);

export const playlistEntries = pgTable(
    "playlist_entries",
    {
        playlistId: uuid().notNull().references(() => playlists.id, { onDelete: "cascade" }),
        position: smallint().notNull(),
        storyId: text().references(() => stories.id, { onDelete: "cascade" }),
        regionSlug: text().references(() => regions.slug, { onDelete: "cascade" }),
    },
    (t) => [primaryKey({ columns: [t.playlistId, t.position] }), check("playlist_entries_one_target", sql`(${t.storyId} is null) <> (${t.regionSlug} is null)`)],
);

// Badges de région : gagnés à l'achat de la collection complète d'une région
export const userBadges = pgTable(
    "user_badges",
    {
        userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
        regionSlug: text().notNull().references(() => regions.slug, { onDelete: "cascade" }),
        createdAt: at().notNull().defaultNow(),
    },
    (t) => [primaryKey({ columns: [t.userId, t.regionSlug] })],
);

// Boutique de points

export const items = pgTable("items", {
    id: text().primaryKey(),
    title: text().notNull(),
    description: text().notNull(),
    costPoints: integer().notNull(),
    image: text().notNull(),
    category: itemCategory().notNull(),
    tint: tint().notNull(),
});

// Un item possédé par ligne. usedAt renseigné = bon de réduction consommé (on peut alors en racheter un).
export const userItems = pgTable(
    "user_items",
    {
        id: uuid().primaryKey().defaultRandom(),
        userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
        itemId: text().notNull().references(() => items.id, { onDelete: "cascade" }),
        createdAt: at().notNull().defaultNow(),
        usedAt: at(),
    },
    (t) => [index().on(t.userId)],
);

// Points : chaque gain ou dépense se déduit des tables métier, le solde est la somme

const p = (n: number) => sql.raw(String(n));

export const pointEvents = pgView("point_events", {
    id: text().notNull(),
    userId: uuid().notNull(),
    label: text().notNull(),
    points: integer().notNull(),
    at: at().notNull(),
}).as(sql`
    select 'validation:' || a.id as id, a.user_id, 'Anecdote validée : ' || a.title as label, ${p(POINTS.validation)} as points, a.validated_at as at
    from anecdotes a where a.validated_at is not null
    union all
    select 'retenue:' || a.id, a.user_id, 'Anecdote retenue par Lunii : ' || a.title, ${p(POINTS.retenue)}, coalesce(a.validated_at, a.created_at)
    from anecdotes a where a.status >= 2
    union all
    select 'trajet:' || b.id, b.passenger_id, 'Trajet effectué : ' || cf.name || ' → ' || ct.name, ${p(POINTS.trajet)}, j.arrive_at
    from bookings b
    join journeys j on j.id = b.journey_id
    join cities cf on cf.slug = j.from_city
    join cities ct on ct.slug = j.to_city
    where b.status = 'acceptee' and j.cancelled_at is null and j.arrive_at < now()
    union all
    select 'conduite:' || j.id, j.driver_id, 'Trajet conduit : ' || cf.name || ' → ' || ct.name, ${p(POINTS.conduite)}, j.arrive_at
    from journeys j
    join cities cf on cf.slug = j.from_city
    join cities ct on ct.slug = j.to_city
    where j.cancelled_at is null and j.arrive_at < now()
    union all
    select 'item:' || ui.id, ui.user_id, 'Échange : ' || i.title, -i.cost_points, ui.created_at
    from user_items ui join items i on i.id = ui.item_id
`);
