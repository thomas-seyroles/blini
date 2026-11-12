import styles from "./Sparkle.module.css";

type Props = { size: number; violet?: boolean; className?: string; [key: `data-${string}`]: boolean | undefined };

export default function Sparkle({ size, violet, className, ...data }: Props) {
    return (
        <span
            {...data}
            aria-hidden
            className={`${styles.sparkle} ${violet ? styles.violet : ""} ${className ?? ""}`}
            style={{ width: size, height: size }}
        />
    );
}
