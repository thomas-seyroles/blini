"use client";

import { usePathname } from "next/navigation";
import CartButton from "../CartButton/CartButton";
import TabBar from "../TabBar/TabBar";

// Pages d'onglet : panier et tab bar communs. Steppers et pages de détail n'en ont pas.
const globalPages = ["/", "/histoires", "/histoires/boutique", "/raconter", "/cadeaux", "/compte"];

export default function AppChrome() {
    if (!globalPages.includes(usePathname())) return null;
    return (
        <>
            <CartButton />
            <TabBar />
        </>
    );
}
