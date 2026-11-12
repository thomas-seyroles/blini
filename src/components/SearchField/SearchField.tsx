import Image from "next/image";
import styles from "./SearchField.module.css";

type SearchFieldProps = {
    label: string;
    value: string;
    placeholder: string;
    side: "start" | "end";
    active?: boolean;
    onClick: () => void;
}

export default function SearchField({ label, value, placeholder, side, active, onClick }: SearchFieldProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`${styles.root} ${styles[side]} ${active ? styles.active : ""}`}
        >
            <Image className={styles.decor} src="/images/decor.svg" alt="" width={57} height={52} />
            <div className={styles.box} />
            <Image className={styles.pin} src="/images/pastille.svg" alt="" width={22} height={22} />
            <div className={styles.texts}>
                <span className={styles.label}>{label}</span>
                <span className={value ? styles.value : styles.placeholder}>{value || placeholder}</span>
            </div>
        </button>
    )
}
