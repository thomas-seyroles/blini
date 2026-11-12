import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// Vérification optimiste : sans cookie de session, direction l'écran de connexion. La signature est vérifiée côté serveur.
export function proxy(request: NextRequest) {
    if (!request.cookies.has(SESSION_COOKIE)) return NextResponse.redirect(new URL("/connexion", request.url));
}

export const config = {
    matcher: ["/((?!connexion|api|_next|images|icons|fonts|favicon.ico|icon|apple-icon|manifest.webmanifest).*)"],
};
