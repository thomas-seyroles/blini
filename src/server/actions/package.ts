"use server";

import { refresh } from "next/cache";
import { canClaimPackage, packageTotal } from "@/lib/package";
import { requireUser } from "../auth";
import { db } from "../db";
import { packageOrders } from "../db/schema";
import { text } from "../validate";

export type PackageInput = { recipient: string; street: string; postalCode: string; city: string; conteuse: boolean };

// Commande fictive : aucun paiement réel, une seule commande par compte
export async function claimPackage(input: PackageInput): Promise<{ ok?: boolean; error?: string }> {
    const user = await requireUser();
    if (!canClaimPackage(!!user.blablacarId, user.blablacarTrips)) return { error: "Tu n’es pas encore éligible au package." };

    const recipient = text(input.recipient, 120);
    const street = text(input.street, 200);
    const postalCode = text(input.postalCode, 5);
    const city = text(input.city, 100);
    if (!recipient || !street || !city || !/^\d{5}$/.test(postalCode)) return { error: "Adresse de livraison incomplète." };

    const conteuse = input.conteuse === true;
    const inserted = await db.insert(packageOrders).values({ userId: user.id, recipient, street, postalCode, city, conteuse, totalCents: packageTotal(conteuse) }).onConflictDoNothing().returning({ id: packageOrders.userId });
    if (!inserted.length) return { error: "Tu as déjà commandé ton package." };

    refresh();
    return { ok: true };
}
