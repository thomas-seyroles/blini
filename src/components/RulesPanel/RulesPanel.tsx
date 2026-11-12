"use client";

import { useApp } from "@/components/AppState/AppState";
import Button from "@/components/Button/Button";
import flow from "@/components/FlowPage/FlowPage.module.css";
import { flag, setSetting } from "@/lib/account";
import styles from "./RulesPanel.module.css";

const RULES = [
    { title: "Consentement", text: "Tous les passagers doivent donner leur accord avant qu’une anecdote soit enregistrée. Le conducteur le demande à chaque trajet." },
    { title: "Cession des droits", text: "En envoyant une anecdote, tu cèdes à Lunii les droits nécessaires pour l’adapter en histoire pour enfants, avec mention de ta région." },
    { title: "Protection des mineurs", text: "Aucune voix ni donnée d’enfant n’est conservée ou publiée sans l’accord de ses représentants légaux." },
    { title: "Contenu modéré", text: "Chaque anecdote est vérifiée par l’équipe Lunii. Les contenus injurieux, discriminatoires ou personnels sont refusés." },
];

export default function RulesPanel() {
    const { state, update } = useApp();
    const accepted = flag(state, "reglement");
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
                onClick={() => update(setSetting("reglement", !accepted))}
            />
        </>
    );
}
