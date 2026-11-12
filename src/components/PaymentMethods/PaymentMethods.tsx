"use client";

import { useState, type FormEvent } from "react";
import { Check, CreditCard, Smartphone } from "lucide-react";
import styles from "./PaymentMethods.module.css";

export type SavedCard = { id: string; last4: string; expiry: string };

type PaymentMethodsProps = {
    cards: SavedCard[];
    selectedId: string;
    onSelect: (id: string) => void;
    onAddCard: (card: SavedCard) => void;
};

function validateCard(number: string, expiry: string, cvc: string) {
    if (number.replace(/\s/g, "").length !== 16) return "Le numéro de carte doit contenir 16 chiffres";
    const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry);
    if (!match) return "Date d’expiration invalide (MM/AA)";
    const now = new Date();
    if (2000 + Number(match[2]) < now.getFullYear() || (2000 + Number(match[2]) === now.getFullYear() && Number(match[1]) < now.getMonth() + 1)) return "Cette carte est expirée";
    if (!/^\d{3}$/.test(cvc)) return "Le cryptogramme doit contenir 3 chiffres";
    return null;
}

export default function PaymentMethods({ cards, selectedId, onSelect, onAddCard }: PaymentMethodsProps) {
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ number: "", expiry: "", cvc: "" });
    const [cardError, setCardError] = useState<string | null>(null);

    const submitCard = (e: FormEvent) => {
        e.preventDefault();
        const error = validateCard(form.number, form.expiry, form.cvc);
        setCardError(error);
        if (error) return;
        onAddCard({ id: `card-${form.number.replace(/\s/g, "").slice(-4)}-${cards.length}`, last4: form.number.replace(/\s/g, "").slice(-4), expiry: form.expiry });
        setForm({ number: "", expiry: "", cvc: "" });
        setAdding(false);
    };

    return (
        <div className={styles.methods} role="radiogroup" aria-label="Moyen de paiement">
            {[
                ...cards.map((c) => ({ id: c.id, title: `Carte •••• ${c.last4}`, hint: `Expire ${c.expiry}`, icon: CreditCard })),
                { id: "mobile", title: "Paiement mobile", hint: "Validation sur ton téléphone", icon: Smartphone },
            ].map(({ id, title, hint, icon: Icon }) => {
                const selected = selectedId === id;
                return (
                    <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`${styles.method} ${selected ? styles.selected : ""}`}
                        onClick={() => onSelect(id)}
                    >
                        <span className={styles.pastille}><Icon size={18} /></span>
                        <span className={styles.methodTexts}>
                            <span className={styles.methodTitle}>{title}</span>
                            <span className={styles.methodHint}>{hint}</span>
                        </span>
                        <span className={styles.radio}>{selected && <Check size={14} />}</span>
                    </button>
                );
            })}
            {adding ? (
                <form className={styles.cardForm} onSubmit={submitCard} noValidate>
                    <input
                        className={styles.input}
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="Numéro de carte"
                        aria-label="Numéro de carte"
                        maxLength={19}
                        value={form.number}
                        onChange={(e) => setForm({ ...form, number: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ") })}
                    />
                    <div className={styles.cardRow}>
                        <input
                            className={styles.input}
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            placeholder="MM/AA"
                            aria-label="Date d’expiration"
                            maxLength={5}
                            value={form.expiry}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                                setForm({ ...form, expiry: digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits });
                            }}
                        />
                        <input
                            className={styles.input}
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            placeholder="CVC"
                            aria-label="Cryptogramme"
                            maxLength={3}
                            value={form.cvc}
                            onChange={(e) => setForm({ ...form, cvc: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                        />
                    </div>
                    {cardError && <p className={styles.error} role="alert">{cardError}</p>}
                    <div className={styles.cardActions}>
                        <button type="button" className={styles.cancel} onClick={() => { setAdding(false); setCardError(null); }}>Annuler</button>
                        <button type="submit" className={styles.add}>Ajouter la carte</button>
                    </div>
                </form>
            ) : (
                <button type="button" className={styles.addLink} onClick={() => setAdding(true)}>+ Ajouter une carte</button>
            )}
        </div>
    );
}
