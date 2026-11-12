"use client";

import { useState } from "react";
import Field from "../Field/Field";
import styles from "./DetailsEditor.module.css";

type DetailsEditorProps = {
    initial: string;
    onSave: (details: string) => void;
    onCancel: () => void;
}

export default function DetailsEditor({ initial, onSave, onCancel }: DetailsEditorProps) {
    const [value, setValue] = useState(initial);

    return (
        <form className={styles.root} onSubmit={(e) => { e.preventDefault(); onSave(value.trim()); }}>
            <Field label="Détails écrits" value={value} onChange={setValue} multiline maxLength={500} placeholder="Qui, où, quand ? Un détail qui rend l’histoire unique…" />
            <div className={styles.actions}>
                <button type="button" className={styles.cancel} onClick={onCancel}>Annuler</button>
                <button type="submit" className={styles.save}>Enregistrer</button>
            </div>
        </form>
    );
}
