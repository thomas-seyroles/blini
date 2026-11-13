"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Feather } from "lucide-react";
import { useCatalog } from "../AppState/AppState";
import styles from "./Credits.module.css";

// Icône de crédits d'une histoire : ouvre l'auteur Lunii et les contributeurs, dont les comptes publics sont cliquables
export default function Credits({ storyId }: { storyId: string }) {
    const story = useCatalog().storyById(storyId);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
        // La page quittée reste montée (cachée) : une modale ouverte rendrait la page suivante inerte
        return () => dialog.close();
    }, [open]);

    if (!story) return null;
    const close = () => setOpen(false);

    return (
        <>
            <button type="button" className={styles.trigger} onClick={() => setOpen(true)} aria-label="Crédits de l’histoire">
                <Feather size={20} />
            </button>
            <dialog ref={ref} className={styles.root} onClose={close} onClick={(e) => e.target === ref.current && close()} aria-label={`Crédits de ${story.title}`}>
                <h2 className={styles.title}>Crédits</h2>
                <p className={styles.story}>{story.title}</p>

                <h3 className={styles.heading}>Écrite par</h3>
                <p className={styles.author}>{story.luniiAuthor}</p>
                <p className={styles.role}>Équipe d’auteurs Lunii</p>

                <h3 className={styles.heading}>Anecdote{story.contributors.length > 1 ? "s" : ""} de</h3>
                <ul className={styles.list}>
                    {story.contributors.map((c) => (
                        <li key={c.id}>
                            <Link href={`/profil/${c.id}`} transitionTypes={["nav-forward"]} className={styles.contributor}>
                                <Image className={styles.photo} src={c.photo} alt="" width={40} height={40} />
                                <span>{c.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <button type="button" className={styles.close} onClick={close}>Fermer</button>
            </dialog>
        </>
    );
}
