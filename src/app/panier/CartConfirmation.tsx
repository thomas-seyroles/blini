"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useApp } from "@/components/AppState/AppState";
import Button from "@/components/Button/Button";
import { useCartFlow } from "@/components/CartFlow/CartFlow";
import CartLineRow from "@/components/CartLineRow/CartLineRow";
import FlowPage from "@/components/FlowPage/FlowPage";
import flow from "@/components/FlowPage/FlowPage.module.css";
import { duration, price, regionBySlug, regionName, storyById } from "@/lib/stories";
import styles from "./panier.module.css";

const dir = "/images/confirmation";

export default function CartConfirmation() {
    const router = useRouter();
    const { update } = useApp();
    const { purchase } = useCartFlow();

    useEffect(() => {
        if (!purchase) router.replace("/histoires/boutique");
    }, [purchase, router]);

    if (!purchase) return null;

    const bought = purchase.storyIds.flatMap((id) => storyById(id) ?? []);
    const listen = () => update((s) => ({ ...s, nowPlaying: purchase.storyIds[0] ?? s.nowPlaying }));

    return (
        <FlowPage>
            <div className={styles.listen}>
                <Link href="/histoires/boutique" transitionTypes={["nav-back"]} className={styles.close} aria-label="Fermer">
                    <X size={16} />
                </Link>
            </div>

            <div className={styles.illustration}>
                <Image className={styles.halo} src={`${dir}/halo.svg`} alt="" width={170} height={170} />
                <Image className={styles.mascot} src="/images/mascotte-casque.png" alt="" width={137} height={150} priority />
                <Image className={`${styles.spark} ${styles.sparkA}`} src={`${dir}/etincelle-jaune-grande.svg`} alt="" width={20} height={20} />
                <Image className={`${styles.spark} ${styles.sparkB}`} src={`${dir}/etincelle-violette-moyenne.svg`} alt="" width={14} height={14} />
                <Image className={`${styles.spark} ${styles.sparkC}`} src={`${dir}/etincelle-jaune-petite.svg`} alt="" width={12} height={12} />
                <Image className={`${styles.spark} ${styles.sparkD}`} src={`${dir}/etincelle-violette-petite.svg`} alt="" width={12} height={12} />
            </div>

            <div className={styles.title}>
                <h1 className={styles.heading}>Merci pour ton achat !</h1>
                <p className={styles.text}>
                    {bought.length} histoire{bought.length > 1 ? "s" : ""} ajoutée{bought.length > 1 ? "s" : ""} à ta bibliothèque · {price(purchase.paid)} payés
                </p>
            </div>

            <section className={styles.listen}>
                <h2 className={flow.heading}>Tes nouvelles histoires</h2>
                <ul className={styles.list}>
                    {bought.map((s) => (
                        <CartLineRow
                            key={s.id}
                            title={s.title}
                            meta={`${regionName(s.regionSlug)} · ${duration(s.durationSec)} · ${s.age}`}
                            cover={regionBySlug(s.regionSlug)?.cover ?? null}
                        />
                    ))}
                </ul>
            </section>

            <div className={styles.actions}>
                <Button label="Écouter maintenant" link="/histoires" onClick={listen} transitionTypes={["nav-forward"]} type="primary" />
                <Link href="/histoires/boutique" transitionTypes={["nav-back"]} className={flow.centerLink}>Continuer mes achats</Link>
            </div>
        </FlowPage>
    );
}
