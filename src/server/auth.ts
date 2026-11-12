import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "./db";
import { users } from "./db/schema";
import { readSession } from "./session";

// Utilisateur de la requête, lu une seule fois par rendu
export const getCurrentUser = cache(async () => {
    const userId = await readSession();
    if (!userId) return null;
    const [user] = await db
        .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            photo: users.photo,
            role: users.role,
            blablacarId: users.blablacarId,
            luniiId: users.luniiId,
            rulesAcceptedAt: users.rulesAcceptedAt,
            blablacarTrips: users.blablacarTrips,
            settings: users.settings,
        })
        .from(users)
        .where(eq(users.id, userId));
    return user ?? null;
});

// Pour les Server Actions et les pages : sans session valide, retour à la connexion
export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) redirect("/connexion");
    return user;
}
