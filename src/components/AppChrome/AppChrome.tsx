"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPath } from "@/lib/navHistory";
import CartButton from "../CartButton/CartButton";
import TabBar from "../TabBar/TabBar";

// Pages d'onglet : panier et tab bar communs. Steppers et pages de détail n'en ont pas.
const globalPages = ["/", "/histoires", "/histoires/bibliotheque", "/histoires/boutique", "/raconter", "/cadeaux", "/compte"];

export default function AppChrome() {
    const pathname = usePathname();
    useEffect(() => trackPath(pathname), [pathname]);
    if (!globalPages.includes(pathname)) return null;
    return (
        <>
            <CartButton />
            <TabBar />
        </>
    );
}
