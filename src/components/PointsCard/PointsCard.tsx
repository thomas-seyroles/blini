"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useApp } from "@/components/AppState/AppState";
import Button from "@/components/Button/Button";
import { fmt, nextGoal } from "@/lib/items";
import styles from "./PointsCard.module.css";

const rules = [
    { pts: "+50 pts", text: "quand ton histoire est validée" },
    { pts: "+300 pts", text: "si l’équipe Lunii l’utilise" },
];

// Compte jusqu’à la valeur cible, sans animation si l’utilisateur la réduit
function useCountTo(target: number) {
    const [shown, setShown] = useState(target);
    const from = useRef(target);
    useEffect(() => {
        if (from.current === target) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            from.current = target;
            setShown(target);
            return;
        }
        const start = performance.now();
        const origin = from.current;
        let raf = requestAnimationFrame(function tick(now) {
            const t = Math.min((now - start) / 700, 1);
            setShown(Math.round(origin + (target - origin) * (1 - (1 - t) ** 3)));
            if (t < 1) raf = requestAnimationFrame(tick);
            else from.current = target;
        });
        return () => cancelAnimationFrame(raf);
    }, [target]);
    return shown;
}

export default function PointsCard() {
    const { state } = useApp();
    const shown = useCountTo(state.points);
    const goal = nextGoal(state.points, state.inventory);
    const ratio = goal ? Math.min(state.points / goal.cost, 1) : 1;

    return (
        <section className={styles.root} aria-label="Mes points">
            <p className={styles.label}>Points</p>
            <div className={styles.balance}>
                <Image src="/images/cadeaux/surligneur.svg" alt="" width={190} height={30} className={styles.highlight} />
                <p className={styles.value} aria-live="polite">
                    {fmt(shown)}
                    <Image src="/images/cadeaux/etoile.svg" alt="" width={39} height={39} className={styles.star} />
                </p>
            </div>
            <div className={styles.gauge} role="progressbar" aria-label="Progression vers le prochain objectif" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)}>
                <div className={styles.fill} style={{ width: `${ratio * 100}%` }} />
            </div>
            <p className={styles.goal}>
                {goal ? `Plus que ${fmt(goal.cost - state.points)} pts avant ${goal.id === "casque-bluni" ? "le casque édition Bluni" : `« ${goal.title} »`}` : "Tu peux tout échanger dans la boutique, bravo !"}
            </p>
            <ul className={styles.rules}>
                {rules.map((r) => (
                    <li key={r.pts} className={styles.rule}>
                        <p className={styles.pts}>
                            {r.pts}
                            <Image src="/images/cadeaux/points23.svg" alt="" width={23} height={23} />
                        </p>
                        <p className={styles.text}>{r.text}</p>
                    </li>
                ))}
            </ul>
            <Button label="Comment gagner des points" link="/cadeaux/points" transitionTypes={["nav-forward"]} icon={Sparkles} type="primary" />
            <Image src="/images/cadeaux/mascotte.png" alt="" width={125} height={130} className={styles.mascot} priority />
        </section>
    );
}
