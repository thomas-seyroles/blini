"use server";

import { randomUUID } from "node:crypto";
import { and, eq, lt, ne, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { isEmail } from "@/lib/account";
import { ROLES, SERVICES, type Role, type Service } from "@/lib/enums";
import { requireUser } from "../auth";
import { db } from "../db";
import { anecdotes, users } from "../db/schema";
import { deleteSession } from "../session";
import { text } from "../validate";

export async function updateProfile(input: { firstName: string; lastName: string; email: string }) {
    const user = await requireUser();
    const firstName = text(input.firstName, 60);
    const lastName = text(input.lastName, 60);
    const email = text(input.email, 200).toLowerCase();
    if (!firstName || !lastName || !isEmail(email)) return { error: "Profil incomplet ou e-mail invalide." };
    const [taken] = await db.select({ id: users.id }).from(users).where(and(eq(users.email, email), ne(users.id, user.id)));
    if (taken) return { error: "Cette adresse e-mail est déjà utilisée." };
    await db.update(users).set({ firstName, lastName, email }).where(eq(users.id, user.id));
    refresh();
    return { ok: true };
}

export async function setRole(role: Role) {
    const user = await requireUser();
    if (!ROLES.includes(role)) return;
    await db.update(users).set({ role }).where(eq(users.id, user.id));
    refresh();
}

// Préférence libre (notifications, langue, favoris…) fusionnée dans le JSON settings
export async function saveSetting(key: string, value: boolean | string) {
    const user = await requireUser();
    if (typeof key !== "string" || !/^[\w-]{1,80}$/.test(key) || !["boolean", "string"].includes(typeof value)) return;
    const safe = typeof value === "string" ? value.slice(0, 40) : value;
    await db.update(users).set({ settings: sql`${users.settings} || ${JSON.stringify({ [key]: safe })}::jsonb` }).where(eq(users.id, user.id));
    refresh();
}

export async function setRulesAccepted(accepted: boolean) {
    const user = await requireUser();
    await db.update(users).set({ rulesAcceptedAt: accepted ? new Date() : null }).where(eq(users.id, user.id));
    refresh();
}

// Liaison fictive : on génère un identifiant de compte externe. Au moins un compte reste lié.
export async function setLinked(service: Service, linked: boolean) {
    const user = await requireUser();
    if (!SERVICES.includes(service)) return;
    const other = service === "blablacar" ? user.luniiId : user.blablacarId;
    if (!linked && !other) return { error: "Au moins un compte doit rester lié." };
    const value = linked ? `${service}-${randomUUID().slice(0, 8)}` : null;
    await db.update(users).set(service === "blablacar" ? { blablacarId: value } : { luniiId: value }).where(eq(users.id, user.id));
    refresh();
    return { ok: true };
}

// Effacement des anecdotes que l'équipe Lunii n'a pas encore retenues
export async function deleteRecordings() {
    const user = await requireUser();
    await db.delete(anecdotes).where(and(eq(anecdotes.userId, user.id), lt(anecdotes.status, 2)));
    refresh();
}

export async function deleteAccount() {
    const user = await requireUser();
    await db.delete(users).where(eq(users.id, user.id));
    await deleteSession();
    redirect("/connexion");
}
