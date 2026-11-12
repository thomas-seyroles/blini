"use client";

import { useEffect, useState } from "react";
import { Check, MapPin, Search } from "lucide-react";
import Module from "../Module/Module";
import styles from "./PlaceModule.module.css";

type Place = { name: string; detail: string };
type Status = "idle" | "loading" | "error" | "done";

const API = "https://api-adresse.data.gouv.fr/search/";

type PlaceModuleProps = {
    title: string;
    placeholder: string;
    value: string;
    onValidate: (place: string) => void;
    onClose: () => void;
}

export default function PlaceModule({ title, placeholder, value, onValidate, onClose }: PlaceModuleProps) {
    const [query, setQuery] = useState(value);
    const [selected, setSelected] = useState(value);
    const [matches, setMatches] = useState<Place[]>(value ? [{ name: value, detail: "" }] : []);
    const [status, setStatus] = useState<Status>("done");

    useEffect(() => {
        const q = query.trim();
        if (q === selected) return;
        if (q.length < 3) return;
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`${API}?q=${encodeURIComponent(q)}&limit=5&autocomplete=1`, { signal: controller.signal });
                if (!res.ok) throw new Error(String(res.status));
                const data: { features: { properties: { label: string; context: string } }[] } = await res.json();
                setMatches(data.features.map((f) => ({ name: f.properties.label, detail: f.properties.context })));
                setStatus("done");
            } catch (err) {
                if ((err as Error).name !== "AbortError") setStatus("error");
            }
        }, 250);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query, selected]);

    const onInput = (v: string) => {
        setQuery(v);
        setSelected("");
        if (v.trim().length < 3) {
            setMatches([]);
            setStatus("idle");
        } else setStatus("loading");
    };

    const message = {
        idle: "Saisissez au moins 3 caractères",
        loading: "Recherche en cours…",
        error: "Service d’adresses indisponible",
        done: matches.length === 0 ? "Aucun lieu trouvé" : "",
    }[status];

    return (
        <Module title={title} onClose={onClose} onClear={() => onValidate("")} onValidate={() => onValidate(selected || value)}>
            <div className={styles.input}>
                <Search size={18} />
                <input
                    autoFocus
                    value={query}
                    onChange={(e) => onInput(e.target.value)}
                    placeholder={placeholder}
                    aria-label={title}
                />
            </div>
            {matches.length > 0 && status !== "idle" && <p className={styles.hint}>Suggestions</p>}
            {message && <p className={styles.empty}>{message}</p>}
            {status !== "idle" && (
                <ul>
                    {matches.map((p) => (
                        <li key={p.name}>
                            <button
                                type="button"
                                className={styles.option}
                                onClick={() => onValidate(p.name)}
                            >
                                <span className={`${styles.pin} ${selected === p.name ? styles.pinSelected : ""}`}>
                                    <MapPin size={18} />
                                </span>
                                <span className={styles.texts}>
                                    <span className={styles.name}>{p.name}</span>
                                    {p.detail && <span className={styles.detail}>{p.detail}</span>}
                                </span>
                                {selected === p.name && <Check size={18} className={styles.check} />}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </Module>
    )
}
