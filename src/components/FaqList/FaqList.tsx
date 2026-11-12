import { Mail } from "lucide-react";
import Button from "@/components/Button/Button";
import flow from "@/components/FlowPage/FlowPage.module.css";
import styles from "./FaqList.module.css";

const FAQ = [
    { q: "Comment enregistrer une anecdote ?", a: "Appuie sur Raconter dans la barre du bas, enregistre ta voix pendant le trajet puis ajoute le lieu et une photo si tu le souhaites." },
    { q: "Combien de temps dure la vérification ?", a: "L’équipe d’auteurs Lunii vérifie la conformité de ton anecdote sous quelques jours. Tu suis son statut depuis Raconter." },
    { q: "Comment gagner des points ?", a: "Tu gagnes des points dès l’envoi d’une anecdote, puis un bonus à sa validation. Ils s’échangent dans Cadeaux." },
    { q: "Qu’est-ce qu’un trajet certifié Bluni ?", a: "Un trajet dont le conducteur a accepté le règlement, a de l’expérience et a lié au moins un compte BlaBlaCar ou Lunii." },
    { q: "Comment supprimer mon compte ?", a: "Depuis Compte, tout en bas, touche Supprimer mon compte et confirme. Les données sont effacées de cet appareil." },
];

export default function FaqList() {
    return (
        <>
            <div className={flow.box}>
                {FAQ.map(({ q, a }) => (
                    <details key={q} className={styles.item}>
                        <summary className={styles.question}>{q}</summary>
                        <p className={styles.answer}>{a}</p>
                    </details>
                ))}
            </div>
            <p className={styles.contact}>Une autre question ? Écris-nous, nous répondons sous 48 h.</p>
            <Button type="primary" icon={Mail} label="Contacter le support" link="mailto:support@bluni.example" />
        </>
    );
}
