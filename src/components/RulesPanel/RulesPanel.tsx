"use client";

import { useApp } from "@/components/AppState/AppState";
import Button from "@/components/Button/Button";
import flow from "@/components/FlowPage/FlowPage.module.css";
import { RULES } from "@/lib/rules";
import { setRulesAccepted } from "@/server/actions/account";
import styles from "./RulesPanel.module.css";

export default function RulesPanel() {
    const { state } = useApp();
    const accepted = state.profile.rulesAccepted;
    return (
        <>
            {RULES.map(({ title, text }) => (
                <section key={title} className={`${flow.box} ${styles.card}`}>
                    <h2 className={flow.heading}>{title}</h2>
                    <p className={styles.text}>{text}</p>
                </section>
            ))}
            <p className={styles.status} role="status">{accepted ? "Tu as accepté le règlement." : "Tu n’as pas accepté le règlement : les trajets certifiés te sont fermés."}</p>
            <Button
                type={accepted ? "secondary" : "primary"}
                label={accepted ? "Retirer mon acceptation" : "J’accepte le règlement"}
                onClick={() => setRulesAccepted(!accepted)}
            />
        </>
    );
}
