"use client";

import { useEffect, useRef } from "react";
import styles from "./ConfirmDialog.module.css";

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    text: string;
    confirmLabel: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({ open, title, text, confirmLabel, cancelLabel = "Annuler", danger, onConfirm, onCancel }: ConfirmDialogProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog ref={ref} autoFocus className={styles.root} onClose={onCancel} onClick={(e) => e.target === ref.current && onCancel()}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.text}>{text}</p>
            <div className={styles.actions}>
                <button type="button" className={styles.cancel} onClick={onCancel}>{cancelLabel}</button>
                <button type="button" className={`${styles.confirm} ${danger ? styles.danger : ""}`} onClick={onConfirm}>{confirmLabel}</button>
            </div>
        </dialog>
    );
}
