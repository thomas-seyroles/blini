import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SERVICES, type Service } from "@/lib/enums";
import { loginWithService } from "@/server/actions/auth";
import { OAUTH_ACCOUNTS } from "@/server/oauth";
import styles from "../connexion.module.css";

const NAMES: Record<Service, string> = { blablacar: "BlaBlaCar", lunii: "Lunii" };

// Connexion fictive : on choisit un compte de l'annuaire du service, à la place d'une vraie redirection OAuth
export default async function ChooseAccount({ params }: PageProps<"/connexion/[service]">) {
  const { service } = await params;
  if (!SERVICES.includes(service as Service)) notFound();
  const name = NAMES[service as Service];
  const accounts = OAUTH_ACCOUNTS.filter((a) => a.service === service);

  return (
    <main className={styles.page}>
      <Link href="/connexion" transitionTypes={["nav-back"]} className={styles.back} aria-label="Retour">
        <ChevronLeft size={20} />
      </Link>
      <Image className={styles.corner} src="/images/mascottes/casque.webp" alt="" width={150} height={164} priority />

      <div className={styles.titles}>
        <p className={styles.hello}>Continuer avec {name}</p>
        <h1 className={styles.title}>CHOISIS TON COMPTE</h1>
      </div>

      <ul className={styles.accounts}>
        {accounts.map((a) => (
          <li key={a.externalId}>
            <form action={loginWithService.bind(null, a.service, a.externalId)}>
              <button type="submit" className={styles.account}>
                <span className={styles.avatar}>
                  <Image src={a.photo} alt="" width={40} height={40} />
                </span>
                <span className={styles.accountTexts}>
                  <span className={styles.accountName}>{a.firstName} {a.lastName}</span>
                  <span className={styles.accountEmail}>{a.email}</span>
                </span>
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
