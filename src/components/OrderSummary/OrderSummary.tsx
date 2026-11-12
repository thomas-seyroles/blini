import { price } from "@/lib/stories";
import flow from "../FlowPage/FlowPage.module.css";
import styles from "./OrderSummary.module.css";

type OrderSummaryProps = {
    items: { label: string; price: number }[];
    discount: { label: string; amount: number } | null;
    total: number;
};

export default function OrderSummary({ items, discount, total }: OrderSummaryProps) {
    return (
        <section className={`${flow.box} ${flow.boxYellow} ${styles.root}`} aria-label="Récapitulatif de commande">
            <ul className={styles.list}>
                {items.map((item) => (
                    <li key={item.label} className={styles.line}>
                        <span>{item.label}</span>
                        <span>{price(item.price)}</span>
                    </li>
                ))}
                {discount && (
                    <li className={`${styles.line} ${styles.discount}`}>
                        <span>{discount.label}</span>
                        <span>−{price(discount.amount)}</span>
                    </li>
                )}
            </ul>
            <p className={styles.total}>
                <span>Total</span>
                <span>{price(total)}</span>
            </p>
        </section>
    );
}
