"use client";

import { useState } from "react";
import { Camera, Download, Mic } from "lucide-react";
import { useApp } from "@/components/AppState/AppState";
import Button from "@/components/Button/Button";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import SettingRow from "@/components/SettingRow/SettingRow";
import flow from "@/components/FlowPage/FlowPage.module.css";
import { flag, setSetting } from "@/lib/account";
import styles from "./PrivacySettings.module.css";

export default function PrivacySettings() {
    const { state, update } = useApp();
    const [message, setMessage] = useState("");
    const [confirm, setConfirm] = useState(false);

    const exportData = () => {
        const { profile, anecdotes, points, trips } = state;
        const blob = new Blob([JSON.stringify({ profile, anecdotes, points, trips }, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "mes-donnees-bluni.json";
        a.click();
        URL.revokeObjectURL(a.href);
        setMessage("Export téléchargé : mes-donnees-bluni.json.");
    };

    return (
        <>
            <div>
                <SettingRow
                    icon={Mic}
                    title="Conserver mes enregistrements audio"
                    subtitle="Pour que l’équipe Lunii puisse les réécouter"
                    toggle={{ checked: flag(state, "gardeVoix"), onChange: (v) => update(setSetting("gardeVoix", v)) }}
                />
                <SettingRow
                    icon={Camera}
                    title="Conserver mes photos"
                    subtitle="Jointes à tes anecdotes, jamais publiées sans accord"
                    toggle={{ checked: flag(state, "gardePhotos"), onChange: (v) => update(setSetting("gardePhotos", v)) }}
                />
            </div>
            <section className={`${flow.box} ${styles.card}`}>
                <h2 className={flow.heading}>Droits cédés</h2>
                <p className={styles.text}>En envoyant une anecdote, tu cèdes à Lunii les droits nécessaires pour l’adapter en histoire. Tu peux retirer une anecdote tant qu’elle n’a pas été retenue.</p>
            </section>
            <Button type="secondary" icon={Download} label="Exporter mes données" onClick={exportData} />
            <Button type="accent" label="Effacer mes enregistrements" onClick={() => setConfirm(true)} />
            {message && <p className={styles.message} role="status">{message}</p>}
            <ConfirmDialog
                open={confirm}
                danger
                title="Effacer tes enregistrements ?"
                text="Tes anecdotes en cours d’écoute seront retirées. Cette action est irréversible."
                confirmLabel="Effacer"
                onCancel={() => setConfirm(false)}
                onConfirm={() => {
                    update((s) => ({ ...s, anecdotes: s.anecdotes.filter((a) => a.status >= 2) }));
                    setConfirm(false);
                    setMessage("Enregistrements effacés.");
                }}
            />
        </>
    );
}
