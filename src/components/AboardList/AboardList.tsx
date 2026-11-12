"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import type { Passenger } from "@/lib/journeys";
import styles from "./AboardList.module.css";

// Passagers déjà à bord : chaque photo ouvre une fiche passager
export default function AboardList({ passengers, summary }: { passengers: Passenger[]; summary: string }) {
    const [selected, setSelected] = useState<Passenger | null>(null);
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (selected && !dialog.open) dialog.showModal();
        if (!selected && dialog.open) dialog.close();
    }, [selected]);

    return (
        <>
            <div className={styles.root}>
                {passengers.map((p) => (
                    <button key={p.id} type="button" className={styles.avatar} onClick={() => setSelected(p)} aria-label={`Profil de ${p.name}`}>
                        <Image src={p.photo} alt="" width={36} height={36} />
                    </button>
                ))}
                <p className={styles.summary}>{summary}</p>
            </div>
            <dialog ref={ref} className={styles.dialog} onClose={() => setSelected(null)} onClick={(e) => e.target === ref.current && setSelected(null)}>
                {selected && (
                    <>
                        <Image className={styles.photo} src={selected.photo} alt="" width={88} height={88} />
                        <h2 className={styles.name}>{selected.name}</h2>
                        <p className={styles.meta}>
                            <ShieldCheck size={14} />
                            Passager · profil vérifié
                        </p>
                        <p className={styles.meta}>{selected.trips === 0 ? "Premier trajet sur Bluni" : `${selected.trips} trajet${selected.trips > 1 ? "s" : ""} sur Bluni`}</p>
                        <button type="button" className={styles.close} onClick={() => setSelected(null)}>Fermer</button>
                    </>
                )}
            </dialog>
        </>
    );
}
