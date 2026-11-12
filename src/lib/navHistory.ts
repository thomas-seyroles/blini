"use client";

import { useRouter } from "next/navigation";

// Pile des pages visitées dans la session : le retour des écrans de détail revient à la page d'où l'on vient
const stack: string[] = [];

export function trackPath(path: string) {
    if (stack.at(-1) === path) return;
    if (stack.at(-2) === path) stack.pop();
    else stack.push(path);
}

// Gestionnaire de clic pour un lien de retour : page précédente si elle existe, sinon `fallback`
export function useBack(fallback: string) {
    const router = useRouter();
    return (e: { preventDefault: () => void }) => {
        e.preventDefault();
        router.push(stack.at(-2) ?? fallback, { transitionTypes: ["nav-back"] });
    };
}
