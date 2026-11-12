import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/server/auth";
import { db } from "@/server/db";
import { anecdotes } from "@/server/db/schema";
import { isUuid } from "@/server/validate";

// Enregistrement d'une anecdote, écoutable par son auteur seulement. Les requêtes Range sont gérées pour Safari.
export async function GET(request: Request, { params }: RouteContext<"/api/anecdotes/[id]/audio">) {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || !isUuid(id)) return new Response(null, { status: 404 });
    const [row] = await db.select({ audio: anecdotes.audio, type: anecdotes.audioType }).from(anecdotes).where(and(eq(anecdotes.id, id), eq(anecdotes.userId, user.id)));
    if (!row?.audio) return new Response(null, { status: 404 });

    const bytes = new Uint8Array(row.audio);
    const headers = { "Content-Type": row.type ?? "audio/webm", "Accept-Ranges": "bytes", "Cache-Control": "private, max-age=3600" };
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
    if (!range) return new Response(bytes, { headers: { ...headers, "Content-Length": String(bytes.length) } });

    const start = range[1] ? Number(range[1]) : 0;
    const end = Math.min(range[2] ? Number(range[2]) : bytes.length - 1, bytes.length - 1);
    if (start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${bytes.length}` } });
    return new Response(bytes.slice(start, end + 1), { status: 206, headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${bytes.length}`, "Content-Length": String(end - start + 1) } });
}
