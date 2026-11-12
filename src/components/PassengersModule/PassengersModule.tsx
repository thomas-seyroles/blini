"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { emptyGuests, type Guests, type Role } from "@/lib/trip";
import Module from "../Module/Module";
import styles from "./PassengersModule.module.css";

const rows: Record<Role, { key: keyof Guests; label: string; hint: string; min: number; max: number }[]> = {
    passager: [
        { key: "adultes", label: "Adultes", hint: "13 ans et plus", min: 1, max: 8 },
        { key: "enfants", label: "Enfants", hint: "2 à 12 ans", min: 0, max: 8 },
        { key: "bebes", label: "Bébés", hint: "Moins de 2 ans", min: 0, max: 8 },
    ],
    conducteur: [
        { key: "places", label: "Places proposées", hint: "Casque Lunii à bord", min: 1, max: 4 },
    ],
};

type PassengersModuleProps = {
    role: Role;
    guests: Guests;
    onValidate: (guests: Guests) => void;
    onClose: () => void;
}

export default function PassengersModule({ role, guests, onValidate, onClose }: PassengersModuleProps) {
    const [draft, setDraft] = useState(guests);
    const change = (key: keyof Guests, delta: number) => setDraft({ ...draft, [key]: draft[key] + delta });

    return (
        <Module
            title={role === "passager" ? "Passagers" : "Places proposées"}
            onClose={onClose}
            onClear={() => onValidate(emptyGuests)}
            onValidate={() => onValidate(draft)}
        >
            <ul>
                {rows[role].map(({ key, label, hint, min, max }) => (
                    <li key={key} className={styles.row}>
                        <div className={styles.texts}>
                            <p className={styles.label}>{label}</p>
                            <p className={styles.hint}>{hint}</p>
                        </div>
                        <button
                            type="button"
                            className={styles.step}
                            disabled={draft[key] <= min}
                            onClick={() => change(key, -1)}
                            aria-label={`Retirer : ${label}`}
                        >
                            <Minus size={16} />
                        </button>
                        <span className={styles.value}>{draft[key]}</span>
                        <button
                            type="button"
                            className={styles.step}
                            disabled={draft[key] >= max}
                            onClick={() => change(key, 1)}
                            aria-label={`Ajouter : ${label}`}
                        >
                            <Plus size={16} />
                        </button>
                    </li>
                ))}
            </ul>
            {role === "passager" && <p className={styles.note}>Un siège enfant peut être demandé au conducteur.</p>}
        </Module>
    )
}
