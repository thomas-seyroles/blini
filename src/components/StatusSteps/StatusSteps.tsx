import { Check } from "lucide-react";
import { STATUSES, type DetailStep } from "@/lib/anecdotes";
import styles from "./StatusSteps.module.css";

type StatusStepsProps =
    | { variant: "compact"; status: number }
    | { variant: "detail"; steps: DetailStep[] };

export default function StatusSteps(props: StatusStepsProps) {
    if (props.variant === "compact") {
        return (
            <ol className={styles.compact} aria-label={`Statut : ${STATUSES[props.status]}`}>
                {STATUSES.map((label, i) => (
                    <li key={label} className={styles.cell} aria-current={i === props.status ? "step" : undefined}>
                        <span className={`${styles.bar} ${i <= props.status ? styles.reached : ""}`} />
                        <span className={`${styles.label} ${i === props.status || (props.status === 4 && i === 4) ? styles.active : ""}`}>{label}</span>
                    </li>
                ))}
            </ol>
        );
    }

    return (
        <ol className={styles.detail}>
            {props.steps.map((s, i) => (
                <li key={s.title} className={styles.row} aria-current={s.state === "current" ? "step" : undefined}>
                    <span className={styles.rail}>
                        <span className={`${styles.dot} ${styles[s.state]}`}>
                            {s.state === "done" && <Check size={12} strokeWidth={3} />}
                            {s.state === "current" && <span className={styles.core} />}
                        </span>
                        {i < props.steps.length - 1 && <span className={`${styles.line} ${s.state === "done" ? styles.lineDone : ""}`} />}
                    </span>
                    <span className={styles.texts}>
                        <span className={`${styles.title} ${s.state === "todo" ? styles.muted : ""}`}>{s.title}</span>
                        <span className={`${styles.sub} ${s.state === "current" ? styles.subCurrent : ""}`}>{s.sub}</span>
                    </span>
                </li>
            ))}
        </ol>
    );
}
