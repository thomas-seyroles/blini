import type { LucideIcon } from "lucide-react";
import styles from "./CriteriaTile.module.css";

type CriteriaTileProps = {
    label: string;
    value: string;
    icon: LucideIcon;
    state?: "default" | "active" | "open" | "add";
    onClick: () => void;
}

export default function CriteriaTile({ label, value, icon: Icon, state = "default", onClick }: CriteriaTileProps) {
    return (
        <button type="button" onClick={onClick} className={`${styles.root} ${styles[state]}`}>
            <span className={styles.badge}><Icon size={16} /></span>
            <span className={styles.texts}>
                <span className={styles.label}>{label}</span>
                <span className={styles.value}>{value}</span>
            </span>
        </button>
    )
}
