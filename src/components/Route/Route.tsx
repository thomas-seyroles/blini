import styles from "./Route.module.css";

type RouteProps = {
    vertical?: boolean;
    tone?: "violet" | "yellow";
    className?: string;
}

export default function Route({ vertical = false, tone = "yellow", className = "" }: RouteProps) {
    return (
        <span aria-hidden className={`${styles.root} ${vertical ? styles.vertical : ""} ${tone === "violet" ? styles.violet : ""} ${className}`}>
            <span className={styles.start} />
            <span className={styles.line} />
            <span className={styles.end} />
        </span>
    );
}
