import FlowHeader from "@/components/FlowHeader/FlowHeader";
import flow from "@/components/FlowPage/FlowPage.module.css";
import FlowPage from "@/components/FlowPage/FlowPage";
import Button from "@/components/Button/Button";
import PointsHistory from "@/components/PointsHistory/PointsHistory";
import SectionTitle from "@/components/SectionTitle/SectionTitle";
import sub from "../sub.module.css";
import styles from "./page.module.css";

const rules = [
  { pts: "+50 pts", name: "Validation par les passagers", text: "Quand tous les passagers ont donné leur consentement et que ton histoire est validée." },
  { pts: "+300 pts", name: "Utilisation par Lunii", text: "Si l’équipe d’auteurs Lunii retient ton anecdote pour en faire une histoire." },
  { pts: "+40 pts", name: "Trajet effectué", text: "Chaque trajet terminé sur Bluni en tant que passager te rapporte des points." },
  { pts: "+60 pts", name: "Trajet conduit", text: "Chaque trajet que tu as publié et conduit jusqu’au bout te rapporte des points." },
];

export default function Page() {
  return (
    <FlowPage>
      <FlowHeader title="Gagner des points" backHref="/cadeaux" />
      <section className={sub.section}>
        <SectionTitle title="Comment gagner des points" subtitle="Les points s’échangent contre des items dans la boutique." />
        <ul className={sub.list}>
          {rules.map((r) => (
            <li key={r.name} className={`${flow.box} ${flow.boxYellow} ${styles.rule}`}>
              <p className={styles.pts}>{r.pts}</p>
              <p className={styles.name}>{r.name}</p>
              <p className={styles.text}>{r.text}</p>
            </li>
          ))}
        </ul>
      </section>
      <Button label="Raconte ton histoire" link="/raconter" transitionTypes={["nav-forward"]} type="primary" />
      <section className={sub.section}>
        <SectionTitle title="Historique des gains" />
        <PointsHistory />
      </section>
      <div className={sub.spacer} />
    </FlowPage>
  );
}
