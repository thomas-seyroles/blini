"use client";

import { useState, type FormEvent } from "react";
import { Tag } from "lucide-react";
import { eur } from "@/lib/journeys";
import { PROMO_CODE } from "@/lib/quote";
import styles from "./PromoField.module.css";

type PromoFieldProps = {
    applied: string | null;
    discount: number;
    onApply: (code: string) => void;
    onRemove: () => void;
};

export default function PromoField({ applied, discount, onApply, onRemove }: PromoFieldProps) {
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (code.trim().toUpperCase() === PROMO_CODE) {
            onApply(PROMO_CODE);
            setCode("");
            setError(null);
        } else {
            setError("Ce code promo n’est pas valide");
        }
    };

    return (
        <>
            <form className={styles.promo} onSubmit={submit}>
                <Tag size={18} />
                {applied ? (
                    <>
                        <p className={styles.promoApplied}>{applied} · −{eur(discount)}</p>
                        <button type="button" className={styles.promoButton} onClick={onRemove}>Retirer</button>
                    </>
                ) : (
                    <>
                        <input
                            className={styles.promoInput}
                            placeholder="Code promo"
                            aria-label="Code promo"
                            value={code}
                            onChange={(e) => { setCode(e.target.value); setError(null); }}
                        />
                        <button type="submit" className={styles.promoButton} disabled={!code.trim()}>Appliquer</button>
                    </>
                )}
            </form>
            {error && <p className={styles.error} role="alert">{error}</p>}
        </>
    );
}
