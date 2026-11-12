"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, MapPin, X } from "lucide-react";
import { useCatalog } from "../AppState/AppState";
import AudioPlayerMini from "../AudioPlayerMini/AudioPlayerMini";
import Button from "../Button/Button";
import Field from "../Field/Field";
import FlowHeader from "../FlowHeader/FlowHeader";
import FlowPage from "../FlowPage/FlowPage";
import { useObjectUrl, useRaconterGuard } from "../RaconterProvider/RaconterProvider";
import styles from "./ContextStep.module.css";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function ContextStep() {
    const ctx = useRaconterGuard("contexte");
    const { regions } = useCatalog();
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);
    const [errors, setErrors] = useState<{ title?: string; place?: string }>({});
    const preview = useObjectUrl(ctx?.draft.photo ?? null);
    const audio = useObjectUrl(ctx?.draft.audio ?? null);
    if (!ctx) return null;

    const { draft, patch } = ctx;
    const query = norm(draft.place.trim());
    const suggestions = regions.filter((r) => norm(r.name).includes(query) && r.name !== draft.place.trim());

    const submit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        const next = {
            title: draft.title.trim() ? undefined : "Donne un titre à ton anecdote.",
            place: draft.place.trim().length >= 2 ? undefined : "Indique un lieu ou une région.",
        };
        setErrors(next);
        if (next.title || next.place) return;
        router.push("/raconter/recapitulatif", { transitionTypes: ["nav-forward"] });
    };

    return (
        <FlowPage>
            <FlowHeader title="Raconter" backHref="/raconter/enregistrement" step={2} steps={4} />

            <form className={styles.form} onSubmit={submit} noValidate>
                <div className={styles.intro}>
                    <h2 className={styles.heading}>Raconte-nous en un peu plus</h2>
                    <p className={styles.text}>Ces infos aident l’équipe Lunii à transformer ton anecdote en histoire.</p>
                </div>

                <AudioPlayerMini durationSec={draft.durationSec} src={audio} />

                <Field
                    label="Titre de ton anecdote"
                    value={draft.title}
                    onChange={(title) => { patch({ title }); setErrors((e) => ({ ...e, title: undefined })); }}
                    error={errors.title}
                    maxLength={80}
                />

                <div className={styles.group}>
                    <Field
                        label="Lieu ou région"
                        value={draft.place}
                        onChange={(place) => { patch({ place }); setErrors((e) => ({ ...e, place: undefined })); }}
                        error={errors.place}
                        icon={<MapPin size={18} color="var(--violet)" />}
                        placeholder="Ex. Saulieu, Bourgogne-Franche-Comté"
                        maxLength={80}
                    />
                    {suggestions.length > 0 && (
                        <ul className={styles.suggestions} aria-label="Suggestions de régions">
                            {suggestions.map((r) => (
                                <li key={r.slug}>
                                    <button type="button" className={styles.chip} onClick={() => { patch({ place: r.name }); setErrors((e) => ({ ...e, place: undefined })); }}>
                                        {r.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <Field label="Quelques mots (facultatif)" value={draft.details} onChange={(details) => patch({ details })} multiline maxLength={500} placeholder="Qui, où, quand ? Un détail qui rend l’histoire unique…" />

                <div className={styles.group}>
                    <span className={styles.label}>Une photo (facultatif)</span>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                            patch({ photo: e.target.files?.[0] ?? null });
                            e.target.value = "";
                        }}
                    />
                    {preview ? (
                        <div className={styles.photo}>
                            <Image src={preview} alt="Aperçu de ta photo" fill unoptimized sizes="140px" />
                            <button type="button" className={styles.remove} onClick={() => patch({ photo: null })} aria-label="Retirer la photo">
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <button type="button" className={styles.add} onClick={() => fileRef.current?.click()}>
                            <span className={styles.addIcon}><ImagePlus size={16} /></span>
                            + Ajouter
                        </button>
                    )}
                </div>

                <Button label="Continuer" type="primary" onClick={submit} />
            </form>
        </FlowPage>
    );
}
