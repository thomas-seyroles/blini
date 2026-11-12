import type { ReactNode } from "react";
import Image from "next/image";
import { BookOpen, Trash2 } from "lucide-react";
import styles from "./CartLineRow.module.css";

type CartLineRowProps = {
    title: string;
    meta: string;
    cover: string | null;
    price?: string;
    badge?: string;
    warning?: string;
    onRemove?: () => void;
    removeLabel?: string;
    children?: ReactNode;
};

export default function CartLineRow({ title, meta, cover, price, badge, warning, onRemove, removeLabel, children }: CartLineRowProps) {
    return (
        <li className={`${styles.row} ${warning ? styles.invalid : ""}`}>
            <div className={styles.main}>
                <span className={styles.cover}>
                    {cover ? <Image src={cover} alt="" width={56} height={56} /> : <BookOpen size={22} />}
                </span>
                <div className={styles.texts}>
                    <p className={styles.title}>{title}</p>
                    <p className={styles.meta}>{meta}</p>
                    {badge && <span className={styles.badge}>{badge}</span>}
                </div>
                {price && <p className={styles.price}>{price}</p>}
                {onRemove && (
                    <button type="button" className={styles.remove} onClick={onRemove} aria-label={removeLabel ?? `Retirer ${title}`}>
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
            {children}
            {warning && <p className={styles.warning} role="alert">{warning}</p>}
        </li>
    );
}
