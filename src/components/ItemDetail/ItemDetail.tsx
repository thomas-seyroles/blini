"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { useApp } from "@/components/AppState/AppState";
import Button from "@/components/Button/Button";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import flow from "@/components/FlowPage/FlowPage.module.css";
import { categoryLabels, fmt, type Item } from "@/lib/items";
import styles from "./ItemDetail.module.css";

export default function ItemDetail({ item }: { item: Item }) {
    const { state, spendPoints, update } = useApp();
    const [confirming, setConfirming] = useState(false);
    const [done, setDone] = useState(false);

    const owned = state.inventory.includes(item.id);
    const missing = item.cost - state.points;

    const exchange = () => {
        setConfirming(false);
        if (owned || !spendPoints(item.cost)) return;
        update((s) => (s.inventory.includes(item.id) ? s : { ...s, inventory: [...s.inventory, item.id] }));
        setDone(true);
    };

    return (
        <>
            <div className={`${styles.visual} ${styles[item.tint]}`}>
                <Image src={item.image} alt="" width={144} height={128} className={styles.art} priority />
            </div>

            <div className={styles.head}>
                <span className={flow.tag}>{categoryLabels[item.category]}</span>
                <h2 className={styles.title}>{item.title}</h2>
                <p className={styles.description}>{item.description}</p>
            </div>

            <dl className={`${flow.box} ${flow.boxYellow} ${styles.numbers}`}>
                <div>
                    <dt>Coût</dt>
                    <dd className={styles.cost}>
                        {fmt(item.cost)} pts
                        <Image src="/images/cadeaux/points18.svg" alt="" width={18} height={18} />
                    </dd>
                </div>
                <div>
                    <dt>Ton solde</dt>
                    <dd aria-live="polite">{fmt(state.points)} pts</dd>
                </div>
            </dl>

            {done && (
                <p className={styles.success} role="status">
                    <CheckCircle2 size={20} />
                    Échange réussi : « {item.title} » est dans ta collection. Il te reste {fmt(state.points)} pts.
                </p>
            )}

            {owned ? (
                <>
                    <Button label="Dans ta collection" type="deactivated" />
                    <Button label="Voir ma collection" link="/cadeaux/collection" transitionTypes={["nav-forward"]} type="secondary" />
                </>
            ) : missing > 0 ? (
                <>
                    <Button label={`Encore ${fmt(missing)} pts`} type="deactivated" />
                    <p className={styles.hint}>Pas assez de points pour cet échange. Raconte une anecdote pour en gagner.</p>
                    <Button label="Gagner des points" link="/cadeaux/points" transitionTypes={["nav-forward"]} type="secondary" />
                </>
            ) : (
                <Button label="Échanger" onClick={() => setConfirming(true)} type="accent" />
            )}

            <ConfirmDialog
                open={confirming}
                title="Échanger tes points ?"
                text={`${fmt(item.cost)} pts seront déduits de ton solde pour obtenir « ${item.title} ».`}
                confirmLabel="Échanger"
                onConfirm={exchange}
                onCancel={() => setConfirming(false)}
            />
        </>
    );
}
