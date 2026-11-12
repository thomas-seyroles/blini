import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";

// Session sans état : un cookie httpOnly « userId.signature », signé avec SESSION_SECRET

const MAX_AGE = 30 * 24 * 3600;

const sign = (userId: string) => createHmac("sha256", process.env.SESSION_SECRET!).update(userId).digest("base64url");

export async function createSession(userId: string) {
    (await cookies()).set(SESSION_COOKIE, `${userId}.${sign(userId)}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: MAX_AGE,
    });
}

export async function deleteSession() {
    (await cookies()).delete(SESSION_COOKIE);
}

export async function readSession(): Promise<string | null> {
    const value = (await cookies()).get(SESSION_COOKIE)?.value;
    const [userId, signature] = value?.split(".") ?? [];
    if (!userId || !signature) return null;
    const expected = Buffer.from(sign(userId));
    const actual = Buffer.from(signature);
    return actual.length === expected.length && timingSafeEqual(actual, expected) ? userId : null;
}
