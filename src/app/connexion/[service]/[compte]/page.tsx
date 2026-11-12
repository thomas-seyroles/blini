import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import ConditionsForm from "@/components/ConditionsForm/ConditionsForm";
import { findAccount } from "@/server/oauth";
import styles from "../../connexion.module.css";

// Inscription à Lunii : l'acceptation des conditions crée le compte Bluni
export default async function Conditions({ params }: PageProps<"/connexion/[service]/[compte]">) {
  const { service, compte } = await params;
  const account = findAccount(service, compte);
  if (!account) notFound();

  return (
    <main className={styles.page}>
      <Link href={`/connexion/${service}`} transitionTypes={["nav-back"]} className={styles.back} aria-label="Retour">
        <ChevronLeft size={20} />
      </Link>

      <div className={styles.titles}>
        <p className={styles.hello}>Bienvenue {account.firstName}</p>
        <h1 className={styles.title}>LIS LES CONDITIONS</h1>
      </div>

      <p className={styles.info}>
        <span className={styles.infoIcon}><ShieldCheck size={16} /></span>
        <span>Valider ces conditions t’inscrit à Lunii : ton compte Bluni est créé avec ton identité {service === "blablacar" ? "BlaBlaCar" : "Lunii"}.</span>
      </p>

      <ConditionsForm service={service} externalId={compte} />
    </main>
  );
}
