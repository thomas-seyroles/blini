import { CircleCheck } from "lucide-react";
import styles from "./LinkedAccountRow.module.css";

type LinkedAccountRowProps = {
    service: string;
    linked: boolean;
    status: string;
    canUnlink: boolean;
    onLink: () => void;
    onUnlink: () => void;
}

export default function LinkedAccountRow({ service, linked, status, canUnlink, onLink, onUnlink }: LinkedAccountRowProps) {
    return (
        <li className={styles.root}>
            <span className={styles.logo}>logo</span>
            <span className={styles.texts}>
                <span className={styles.service}>{service}</span>
                <span className={styles.status}>{status}</span>
            </span>
            {linked ? (
                <span className={styles.side}>
                    <span className={styles.linked}><CircleCheck size={18} />Lié</span>
                    <button
                        type="button"
                        className={styles.unlink}
                        onClick={onUnlink}
                        disabled={!canUnlink}
                        title={canUnlink ? undefined : "Au moins un compte doit rester lié"}
                    >
                        Délier
                    </button>
                </span>
            ) : (
                <button type="button" className={styles.link} onClick={onLink}>Lier</button>
            )}
        </li>
    );
}
