import Image from "next/image";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { fmt, type Item } from "@/lib/items";
import styles from "./ItemCard.module.css";

type ItemCardProps = {
    item: Item;
    points: number;
    owned: boolean;
}

export default function ItemCard({ item, points, owned }: ItemCardProps) {
    const missing = item.cost - points;
    const state = owned ? styles.owned : missing > 0 ? styles.locked : styles.available;
    return (
        <li className={styles.cell}>
            <Link href={`/cadeaux/items/${item.id}`} transitionTypes={["nav-forward"]} className={`${styles.card} ${state}`}>
                <span className={`${styles.visual} ${styles[item.tint]}`}>
                    <Image src={item.image} alt="" width={72} height={64} className={styles.art} />
                </span>
                <span className={styles.title}>{item.title}</span>
                <span className={styles.price}>
                    {fmt(item.cost)} pts
                    <Image src="/images/cadeaux/points18.svg" alt="" width={18} height={18} />
                </span>
                <span className={styles.action}>
                    {owned ? <><Check size={16} />Obtenu</> : missing > 0 ? <><Lock size={16} />Encore {fmt(missing)} pts</> : "Échanger"}
                </span>
            </Link>
        </li>
    );
}
