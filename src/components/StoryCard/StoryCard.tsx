"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { useApp } from "@/components/AppState/AppState";
import type { Story } from "@/lib/stories";
import styles from "./StoryCard.module.css";

export default function StoryCard({ story }: { story: Story }) {
    const { play, catalog } = useApp();
    const region = catalog.regionBySlug(story.regionSlug);
    return (
        <li className={styles.root}>
            <div className={styles.cover}>
                {region?.cover && <Image src={region.cover} alt="" fill sizes="150px" className={styles.image} />}
                <span className={styles.tag}>Publiée</span>
                <Link
                    href="/histoires"
                    transitionTypes={["nav-forward"]}
                    className={styles.play}
                    aria-label={`Écouter ${story.title}`}
                    onClick={() => play(story.id)}
                >
                    <Play size={18} fill="currentColor" />
                </Link>
            </div>
            <p className={styles.title}>{story.title}</p>
            <p className={styles.meta}>{region?.name} · {Math.round(story.durationSec / 60)} min</p>
        </li>
    );
}
