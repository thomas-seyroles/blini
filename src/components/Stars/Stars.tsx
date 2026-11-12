import { Star } from "lucide-react";
import styles from "./Stars.module.css";

// Note de 1 à 5 : étoiles pleines puis étoiles vides
export default function Stars({ rating }: { rating: number }) {
    return (
        <span className={styles.root} role="img" aria-label={`${rating} sur 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={14} className={n <= rating ? styles.full : styles.empty} />
            ))}
        </span>
    );
}
