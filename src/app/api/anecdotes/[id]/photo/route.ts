import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/server/auth";
import { db } from "@/server/db";
import { anecdotes } from "@/server/db/schema";
import { isUuid } from "@/server/validate";

// Photo d'une anecdote, visible par son auteur seulement
export async function GET(_: Request, { params }: RouteContext<"/api/anecdotes/[id]/photo">) {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || !isUuid(id)) return new Response(null, { status: 404 });
    const [row] = await db.select({ photo: anecdotes.photo }).from(anecdotes).where(and(eq(anecdotes.id, id), eq(anecdotes.userId, user.id)));
    if (!row?.photo) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(row.photo), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=3600" } });
}
