import "server-only";
import { asc, eq } from "drizzle-orm";
import { DEFAULT_PHOTO } from "@/lib/journeys";
import { db } from "../db";
import { driverProfiles, storyContributors, userBadges, users } from "../db/schema";
import { isUuid } from "../validate";

// Profil public d'un compte : prénom et initiale, photo, rôle, badges et histoires inspirées. Jamais d'e-mail ni de nom complet.
export async function getPublicProfile(userId: string) {
    if (!isUuid(userId)) return null;
    const [row] = await db
        .select({ firstName: users.firstName, lastName: users.lastName, photo: users.photo, role: users.role, profile: driverProfiles })
        .from(users)
        .leftJoin(driverProfiles, eq(driverProfiles.userId, users.id))
        .where(eq(users.id, userId));
    if (!row) return null;

    const [badges, contributions] = await Promise.all([
        db.select({ regionSlug: userBadges.regionSlug }).from(userBadges).where(eq(userBadges.userId, userId)).orderBy(asc(userBadges.createdAt)),
        db.select({ storyId: storyContributors.storyId }).from(storyContributors).where(eq(storyContributors.userId, userId)).orderBy(asc(storyContributors.storyId)),
    ]);

    return {
        name: `${row.firstName} ${row.lastName.charAt(0)}.`,
        firstName: row.firstName,
        photo: row.photo ?? DEFAULT_PHOTO,
        role: row.role,
        driver: row.profile ? { car: `${row.profile.car} ${row.profile.color}`.trim(), rating: row.profile.rating, reviews: row.profile.reviewsCount, bio: row.profile.bio } : null,
        badges: badges.map((b) => b.regionSlug),
        storyIds: contributions.map((c) => c.storyId),
    };
}
