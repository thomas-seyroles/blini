"use client";

import { useEffect, useRef } from "react";
import styles from "./InfoDialog.module.css";

type InfoDialogProps = { open: boolean; title: string; text: string; onClose: () => void };

// Point info : titre, explication et un seul bouton de fermeture
export default function InfoDialog({ open, title, text, onClose }: InfoDialogProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog ref={ref} className={styles.root} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.text}>{text}</p>
            <button type="button" className={styles.close} onClick={onClose}>Compris</button>
        </dialog>
    );
}
