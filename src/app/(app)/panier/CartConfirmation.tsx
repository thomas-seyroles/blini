"use client";

import { useEffect } from "react";
import Image from "next/image";
import Sparkle from "@/components/Sparkle/Sparkle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useApp } from "@/components/AppState/AppState";
import Button from "@/components/Button/Button";
import { useCartFlow } from "@/components/CartFlow/CartFlow";
import CartLineRow from "@/components/CartLineRow/CartLineRow";
import FlowPage from "@/components/FlowPage/FlowPage";
import flow from "@/components/FlowPage/FlowPage.module.css";
import { duration, price } from "@/lib/stories";
import styles from "./panier.module.css";

const dir = "/images/decors";

export default function CartConfirmation() {
    const router = useRouter();
    const { catalog, play } = useApp();
    const { storyById, regionName, regionBySlug } = catalog;
    const { purchase } = useCartFlow();

    useEffect(() => {
        if (!purchase) router.replace("/histoires/boutique");
    }, [purchase, router]);

    if (!purchase) return null;

    const bought = purchase.storyIds.flatMap((id) => storyById(id) ?? []);
    const listen = () => purchase.storyIds[0] && play(purchase.storyIds[0]);

    return (
        <FlowPage>
            <div className={styles.listen}>
                <Link href="/histoires/boutique" transitionTypes={["nav-back"]} className={styles.close} aria-label="Fermer">
                    <X size={16} />
                </Link>
            </div>

            <div className={styles.illustration}>
                <Image className={styles.halo} src={`${dir}/halo.svg`} alt="" width={170} height={170} />
                <Image className={styles.mascot} src="/images/mascottes/casque.webp" alt="" width={137} height={150} priority />
                <Sparkle className={`${styles.spark} ${styles.sparkA}`} size={20} />
                <Sparkle className={`${styles.spark} ${styles.sparkB}`} size={14} violet />
                <Sparkle className={`${styles.spark} ${styles.sparkC}`} size={12} />
                <Sparkle className={`${styles.spark} ${styles.sparkD}`} size={12} violet />
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
