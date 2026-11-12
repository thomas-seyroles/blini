"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "../db";
import { users } from "../db/schema";
import { findAccount, type OAuthAccount } from "../oauth";
import { createSession, deleteSession } from "../session";

const columnOf = (service: OAuthAccount["service"]) => (service === "blablacar" ? users.blablacarId : users.luniiId);

// Connexion fictive : un compte déjà inscrit entre directement, les autres passent par l'écran des conditions
export async function loginWithService(service: string, externalId: string) {
    const account = findAccount(service, externalId);
    if (!account) return;
    const [user] = await db.select({ id: users.id, rulesAcceptedAt: users.rulesAcceptedAt }).from(users).where(eq(columnOf(account.service), account.externalId));
    if (!user?.rulesAcceptedAt) redirect(`/connexion/${service}/${externalId}`);
    await createSession(user.id);
    redirect("/");
}

// Acceptation des conditions = inscription à Lunii : le compte est ajouté en base s'il n'existe pas encore
export async function acceptConditions(service: string, externalId: string) {
    const account = findAccount(service, externalId);
    if (!account) return;
    const { firstName, lastName, email, photo } = account;
    const link = account.service === "blablacar" ? { blablacarId: externalId } : { luniiId: externalId };
    const [user] = await db
        .insert(users)
        .values({ firstName, lastName, email, photo, ...link, rulesAcceptedAt: new Date() })
        .onConflictDoUpdate({ target: columnOf(account.service), set: { rulesAcceptedAt: new Date() } })
        .returning({ id: users.id });
    await createSession(user.id);
    redirect("/");
}

export async function logout() {
    await deleteSession();
    redirect("/connexion");
}
