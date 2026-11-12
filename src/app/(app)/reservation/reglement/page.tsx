import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import Button from "@/components/Button/Button";
import styles from "./page.module.css";

const articles = [
  { title: "Consentement de tous les passagers", text: "Un passager peut être enregistré pendant le trajet uniquement si toutes les personnes présentes dans le véhicule y consentent. Chacun peut refuser à tout moment. Tu pourras être enregistré·e, et tu valideras les anecdotes à la fin du trajet." },
  { title: "Anecdotes et cession des droits", text: "En envoyant une anecdote, tu cèdes à Lunii les droits nécessaires pour la vérifier, l’adapter et l’intégrer à une histoire régionale pour enfants. Tu valides toi-même tes anecdotes à la fin du trajet." },
  { title: "Protection des mineurs", text: "Aucune voix, photo ou information permettant d’identifier un enfant n’est publiée sans l’accord de ses parents. Les enfants de moins de 12 ans voyagent avec un adulte responsable." },
  { title: "Contenu modéré", text: "L’équipe d’auteurs Lunii vérifie chaque anecdote sous quelques jours. Les contenus injurieux, discriminatoires ou diffamatoires sont refusés." },
  { title: "Trajets certifiés Bluni", text: "Un trajet certifié Bluni a un conducteur vérifié, un règlement accepté, un casque Lunii à bord et au moins un compte BlaBlaCar ou Lunii lié." },
  { title: "Points et annulation", text: "Les points Bluni sont crédités à la fin du trajet. L’annulation est gratuite jusqu’à 24 h avant le départ." },
];

export default function Regulations() {
  return (
    <FlowPage>
      <FlowHeader title="Règlement Bluni" backHref="/reservation/recapitulatif" />
      <ol className={styles.list}>
        {articles.map(({ title, text }, i) => (
          <li key={title} className={styles.article}>
            <h2 className={styles.title}>{i + 1}. {title}</h2>
            <p className={styles.text}>{text}</p>
          </li>
        ))}
      </ol>
      <Button label="J’ai compris" link="/reservation/recapitulatif" transitionTypes={["nav-back"]} type="primary" />
    </FlowPage>
  );
}
