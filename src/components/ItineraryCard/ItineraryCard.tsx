import Route from "../Route/Route";
import styles from "./ItineraryCard.module.css";

type ItineraryCardProps = {
    day: string;
    departTime: string;
    arrivalTime: string;
    from: string;
    to: string;
    fromAddress?: string;
    toAddress?: string;
    footer?: string;
    tone?: "violet" | "yellow";
}

export default function ItineraryCard({ day, departTime, arrivalTime, from, to, fromAddress, toAddress, footer, tone = "violet" }: ItineraryCardProps) {
    const yellow = tone === "yellow";
    return (
        <section className={`${styles.root} ${yellow ? styles.yellow : ""}`}>
            <p className={`${styles.day} ${yellow ? styles.dayYellow : ""}`}>{day}</p>
            <div className={`${styles.schedule} ${fromAddress ? "" : styles.compact}`}>
                <div className={styles.hours}>
                    <p>{departTime}</p>
                    <p>{arrivalTime}</p>
                </div>
                <Route vertical tone="violet" className={styles.trace} />
                <div className={styles.places}>
                    <div>
                        <p className={styles.place}>{from}</p>
                        {fromAddress && <p className={styles.address}>{fromAddress}</p>}
                    </div>
                    <div>
                        <p className={styles.place}>{to}</p>
                        {toAddress && <p className={styles.address}>{toAddress}</p>}
                    </div>
                </div>
            </div>
            {footer && <p className={styles.duration}>{footer}</p>}
        </section>
    );
}
