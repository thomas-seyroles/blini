"use client";

import { useApp } from "@/components/AppState/AppState";
import EmptyState from "@/components/EmptyState/EmptyState";
import StoryCard from "@/components/StoryCard/StoryCard";
import type { Story } from "@/lib/stories";
import styles from "./GiftCarousel.module.css";

// Liste d’histoires offertes : carrousel horizontal, ou grille si wrap
export default function GiftCarousel({ wrap }: { wrap?: boolean }) {
    const { state, catalog } = useApp();
    const gifts = state.gifts.map(catalog.storyById).filter((s): s is Story => !!s);

    if (!gifts.length) {
        return <EmptyState title="Aucune histoire offerte" text="Raconte une anecdote : si l’équipe Lunii l’utilise, une histoire t’est offerte." action={{ label: "Raconte ton histoire", href: "/raconter" }} />;
    }
    return (
        <ul className={wrap ? styles.wrap : styles.track}>
            {gifts.map((s) => <StoryCard key={s.id} story={s} />)}
        </ul>
    );
}
