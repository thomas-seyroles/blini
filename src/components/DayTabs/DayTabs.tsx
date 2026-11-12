"use client";

import { useState } from "react";
import styles from "./DayTabs.module.css";

type Day = { weekday: string; date: string };

export default function DayTabs({ days, initial, onSelect }: { days: Day[]; initial: number; onSelect?: (index: number) => void }) {
    const [active, setActive] = useState(initial);

    return (
        <ul className={styles.root}>
            {days.map((day, i) => (
                <li key={day.date}>
                    <button
                        type="button"
                        className={`${styles.tab} ${i === active ? styles.active : ""}`}
                        aria-pressed={i === active}
                        onClick={() => { setActive(i); onSelect?.(i); }}
                    >
                        <span className={styles.weekday}>{day.weekday}</span>
                        <span className={styles.date}>{day.date}</span>
                    </button>
                </li>
            ))}
        </ul>
    );
}
