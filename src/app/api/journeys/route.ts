import type { NextRequest } from "next/server";
import { regionsBetween, searchJourneys } from "@/server/queries/journeys";
import { isIsoDate } from "@/server/validate";

// Recherche de trajets, appelée par les écrans de résultats et de retour
export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const from = params.get("from") ?? "";
    const to = params.get("to") ?? "";
    const date = params.get("date");
    if (!from || !to || !isIsoDate(date)) return Response.json({ error: "Paramètres manquants" }, { status: 400 });
    const [journeys, regions] = await Promise.all([searchJourneys(from, to, date), regionsBetween(from, to)]);
    return Response.json({ journeys, regions });
}
