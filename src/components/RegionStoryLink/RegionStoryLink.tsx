"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useApp } from "../AppState/AppState";

type RegionStoryLinkProps = { slug: string; className?: string; children: ReactNode };

// Bibliothèque (lecture de l'histoire possédée) si le compte a une histoire de la région, sinon boutique
export default function RegionStoryLink({ slug, className, children }: RegionStoryLinkProps) {
    const { state, catalog, play } = useApp();
    const owned = new Set([...state.ownedStories, ...state.gifts]);
    const story = catalog.storiesOfRegion(slug).find((s) => owned.has(s.id));

    return (
        <Link
            href={story ? "/histoires" : `/histoires/region/${slug}`}
            transitionTypes={["nav-forward"]}
            className={className}
            onClick={() => story && play(story.id)}
        >
            {children}
        </Link>
    );
}
