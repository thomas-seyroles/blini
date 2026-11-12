"use client";

import { useApp } from "@/components/AppState/AppState";
import EmptyState from "@/components/EmptyState/EmptyState";
import flow from "@/components/FlowPage/FlowPage.module.css";
import { fmt } from "@/lib/items";
import styles from "./PointsHistory.module.css";

const months = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];

// Clé de tri mois/jour depuis « 2 nov. » ou « Dim. 2 nov. » ; illisible = le plus récent
const sortKey = (label: string) => {
    const m = label.match(/(\d{1,2})\s+([^\s.]+)/);
    const month = m ? months.findIndex((x) => m[2].toLowerCase().startsWith(x)) : -1;
    return m && month >= 0 ? month * 100 + Number(m[1]) : Infinity;
};

export default function PointsHistory() {
    const { state } = useApp();

    const gains = [
        ...state.anecdotes.filter((a) => a.points > 0).map((a) => ({ id: a.id, title: `Anecdote : ${a.title}`, date: a.sentAt, points: a.points })),
        ...state.trips.filter((t) => t.status === "termine").map((t) => ({ id: t.id, title: `Trajet effectué : ${t.from} → ${t.to}`, date: t.day, points: t.points })),
    ]
        .map((g, i) => ({ ...g, key: sortKey(g.date), i }))
        .sort((a, b) => b.key - a.key || a.i - b.i);

    if (!gains.length) {
        return <EmptyState title="Pas encore de gains" text="Fais valider une anecdote ou effectue un trajet pour gagner tes premiers points." action={{ label: "Raconte ton histoire", href: "/raconter" }} />;
    }
    return (
        <ul className={styles.list}>
            {gains.map((g) => (
                <li key={g.id} className={`${flow.box} ${styles.row}`}>
                    <div className={styles.texts}>
                        <p className={styles.title}>{g.title}</p>
                        <p className={styles.date}>{g.date}</p>
                    </div>
                    <span className={styles.points}>+{fmt(g.points)} pts</span>
                </li>
            ))}
        </ul>
    );
}
