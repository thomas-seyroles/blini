import type { ReactNode } from "react";
import { X } from "lucide-react";
import styles from "./Module.module.css";

type ModuleProps = {
    title: string;
    onClose: () => void;
    onClear: () => void;
    onValidate: () => void;
    clearLabel?: string;
    children: ReactNode;
}

export default function Module({ title, onClose, onClear, onValidate, clearLabel = "Effacer", children }: ModuleProps) {
    return (
        <div className={styles.root} role="dialog" aria-label={title}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                <button type="button" className={styles.close} onClick={onClose} aria-label="Fermer">
                    <X size={14} />
                </button>
            </div>
            <div className={styles.content}>{children}</div>
            <div className={styles.footer}>
                <button type="button" className={styles.clear} onClick={onClear}>{clearLabel}</button>
                <button type="button" className={styles.validate} onClick={onValidate}>Valider</button>
            </div>
        </div>
    )
}
