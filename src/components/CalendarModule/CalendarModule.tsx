"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Module from "../Module/Module";
import styles from "./CalendarModule.module.css";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

const sameDay = (a: Date | null, b: Date) => !!a && a.toDateString() === b.toDateString();

type Dates = { aller: Date; retour: Date | null };

type CalendarModuleProps = Dates & {
    focus: "aller" | "retour";
    onChange: (dates: Dates) => void;
    onClose: () => void;
}

export default function CalendarModule({ aller, retour, focus, onChange, onClose }: CalendarModuleProps) {
    const [today] = useState(() => new Date(new Date().setHours(0, 0, 0, 0)));
    const [month, setMonth] = useState(new Date(aller.getFullYear(), aller.getMonth(), 1));
    const [initial] = useState<Dates>({ aller, retour });

    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const blanks = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const isCurrentMonth = first <= new Date(today.getFullYear(), today.getMonth(), 1);
    const label = first.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

    const pick = (d: Date) => {
        if (focus === "retour" && d >= aller) onChange({ aller, retour: d });
        else onChange({ aller: d, retour: retour && retour >= d ? retour : null });
    };

    return (
        <Module
            title="Dates du trajet"
            onClose={onClose}
            clearLabel="Annuler"
            onClear={() => { onChange(initial); onClose(); }}
            onValidate={onClose}
        >
            <div className={styles.month}>
                <button
                    type="button"
                    className={styles.nav}
                    disabled={isCurrentMonth}
                    onClick={() => setMonth(new Date(first.getFullYear(), first.getMonth() - 1, 1))}
                    aria-label="Mois précédent"
                >
                    <ChevronLeft size={16} />
                </button>
                <p className={styles.monthLabel}>{label[0].toUpperCase() + label.slice(1)}</p>
                <button
                    type="button"
                    className={styles.nav}
                    onClick={() => setMonth(new Date(first.getFullYear(), first.getMonth() + 1, 1))}
                    aria-label="Mois suivant"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
            <div className={styles.grid}>
                {WEEKDAYS.map((d, i) => <span key={i} className={styles.weekday}>{d}</span>)}
                {Array.from({ length: blanks }, (_, i) => <span key={`b${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                    const d = new Date(first.getFullYear(), first.getMonth(), i + 1);
                    const state = sameDay(aller, d) || sameDay(retour, d)
                        ? styles.selected
                        : sameDay(today, d) ? styles.today : "";
                    return (
                        <button
                            key={i}
                            type="button"
                            className={`${styles.day} ${state}`}
                            disabled={d < today}
                            onClick={() => pick(d)}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>
        </Module>
    )
}
