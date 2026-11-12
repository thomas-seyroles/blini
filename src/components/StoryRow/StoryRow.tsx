import Link from "next/link";
import Cover from "../Cover/Cover";
import StoryAction from "../StoryAction/StoryAction";
import { minutes, packById, regionName, storyById } from "@/lib/stories";
import styles from "./StoryRow.module.css";

type StoryRowProps = { kind: "story" | "pack"; id: string };

// Ligne histoire unique : story ou pack, avec son action
export default function StoryRow({ kind, id }: StoryRowProps) {
    const pack = kind === "pack" ? packById(id) : undefined;
    const story = kind === "story" ? storyById(id) : undefined;
    const item = pack ?? story;
    if (!item) return null;
    const infos = pack ? `${pack.storyIds.length} histoires · badge région inclus` : `${regionName(story!.regionSlug)} · ${minutes(story!.durationSec)}`;

    return (
        <li className={`${styles.root} ${pack ? styles.pack : ""}`}>
            <Link href={`/histoires/boutique/${id}`} transitionTypes={["nav-forward"]} className={styles.link}>
                <Cover regionSlug={item.regionSlug} className={styles.cover} />
                <span className={styles.texts}>
                    <span className={styles.title}>{item.title}</span>
                    <span className={styles.infos}>{infos}</span>
                </span>
            </Link>
            <StoryAction kind={kind} id={id} />
        </li>
    );
}
