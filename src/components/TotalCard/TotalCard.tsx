import styles from "./TotalCard.module.css";

type TotalCardProps = { amount: string; summary: string; label?: string };

export default function TotalCard({ amount, summary, label = "Total à payer" }: TotalCardProps) {
    return (
        <section className={styles.total}>
            <p className={styles.totalLabel}>{label}</p>
            <p className={styles.totalAmount}>{amount}</p>
            <p className={styles.totalSummary}>{summary}</p>
        </section>
    );
}
