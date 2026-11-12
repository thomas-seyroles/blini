"use client";

import { useState } from "react";
import { RULES } from "@/lib/rules";
import { acceptConditions } from "@/server/actions/auth";
import Button from "../Button/Button";
import CheckOption from "../CheckOption/CheckOption";
import styles from "./ConditionsForm.module.css";

export default function ConditionsForm({ service, externalId }: { service: string; externalId: string }) {
    const [checked, setChecked] = useState(false);
    return (
        <form action={acceptConditions.bind(null, service, externalId)} className={styles.root}>
            {RULES.map(({ title, text }) => (
                <section key={title} className={styles.card}>
                    <h2 className={styles.heading}>{title}</h2>
                    <p className={styles.text}>{text}</p>
                </section>
            ))}
            <CheckOption label="J’ai lu et j’accepte les conditions Bluni" checked={checked} onChange={setChecked} />
            <Button label="Valider et m’inscrire à Lunii" type={checked ? "primary" : "deactivated"} submit />
        </form>
    );
}
