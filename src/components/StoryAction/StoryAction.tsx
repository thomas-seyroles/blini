"use client";

import Link from "next/link";
import { Check, Play, X } from "lucide-react";
import Button from "../Button/Button";
import { useApp } from "../AppState/AppState";
import { packPrice, price } from "@/lib/stories";
import styles from "./StoryAction.module.css";

type StoryActionProps = { kind: "story" | "pack"; id: string; large?: boolean };

// Action d'achat ou d'écoute d'une histoire ou d'un pack, selon l'état du store
export default function StoryAction({ kind, id, large }: StoryActionProps) {
    const { state, catalog, play, addToCart, removeFromCart } = useApp();
    const pack = kind === "pack" ? catalog.packById(id) : undefined;
    const item = pack ?? catalog.storyById(id);
    if (!item) return null;

    const ownedIds = [...state.ownedStories, ...state.gifts];
    const storyIds = pack ? pack.storyIds : [id];
    // Un pack est acquis une fois son badge obtenu, même si des histoires de la région étaient déjà possédées
    const owned = pack ? state.badges.includes(pack.regionSlug) : ownedIds.includes(id);
    const cost = pack ? packPrice(pack.regionSlug, ownedIds, catalog.stories) : item.price;
    const inCart = state.cart.some((l) => l.kind === kind && l.id === id);
    const line = { kind, id };
    const listen = () => play(storyIds.find((s) => ownedIds.includes(s)) ?? storyIds[0]);
    const tone = kind === "pack" ? styles.yellow : "";

    if (large) {
        if (owned) return <Button label="Écouter" link="/histoires" onClick={listen} transitionTypes={["nav-back"]} type="primary" />;
        if (inCart)
            return (
                <div className={styles.large}>
                    <Button label="Aller au panier" link="/panier" transitionTypes={["nav-forward"]} type="primary" />
                    <Button label="Retirer du panier" onClick={() => removeFromCart(line)} type="secondary" />
                </div>
            );
        return <Button label={`Ajouter au panier · ${price(cost)}`} onClick={() => addToCart(line)} type="primary" />;
    }

    if (owned)
        return (
            <Link href="/histoires" onClick={listen} transitionTypes={["nav-back"]} className={`${styles.pill} ${styles.listen}`}>
                <Play size={14} />
                Écouter
            </Link>
        );
    if (inCart)
        return (
            <button type="button" className={`${styles.pill} ${styles.inCart}`} onClick={() => removeFromCart(line)} aria-label="Retirer du panier">
                <Check size={16} />
                <X size={14} />
            </button>
        );
    return (
        <button type="button" className={`${styles.pill} ${tone}`} onClick={() => addToCart(line)} aria-label={`Ajouter au panier, ${price(cost)}`}>
            {price(cost)}
        </button>
    );
}
