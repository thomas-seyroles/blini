"use client";

import Link from "next/link";
import { Check, Play, X } from "lucide-react";
import Button from "../Button/Button";
import { useApp } from "../AppState/AppState";
import { packById, price, storyById } from "@/lib/stories";
import styles from "./StoryAction.module.css";

type StoryActionProps = { kind: "story" | "pack"; id: string; large?: boolean };

// Action d'achat ou d'écoute d'une histoire ou d'un pack, selon l'état du store
export default function StoryAction({ kind, id, large }: StoryActionProps) {
    const { state, update, addToCart, removeFromCart } = useApp();
    const item = kind === "pack" ? packById(id) : storyById(id);
    if (!item) return null;

    const storyIds = kind === "pack" ? packById(id)!.storyIds : [id];
    const owned = storyIds.every((s) => state.ownedStories.includes(s) || state.gifts.includes(s));
    const inCart = state.cart.some((l) => l.kind === kind && l.id === id);
    const line = { kind, id };
    const listen = () => update((s) => ({ ...s, nowPlaying: storyIds[0] }));
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
        return <Button label={`Ajouter au panier · ${price(item.price)}`} onClick={() => addToCart(line)} type="primary" />;
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
        <button type="button" className={`${styles.pill} ${tone}`} onClick={() => addToCart(line)} aria-label={`Ajouter au panier, ${price(item.price)}`}>
            {price(item.price)}
        </button>
    );
}
