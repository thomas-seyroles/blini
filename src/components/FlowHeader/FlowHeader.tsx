import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./FlowHeader.module.css";

type FlowHeaderProps = {
    title: string;
    backHref: string;
    step?: number;
    steps?: number;
}

export default function FlowHeader({ title, backHref, step, steps = 4 }: FlowHeaderProps) {
    return (
        <header className={styles.root}>
            <div className={styles.bar}>
                <Link href={backHref} transitionTypes={["nav-back"]} className={styles.back} aria-label="Retour">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className={styles.title}>{title}</h1>
                {step && <span className={styles.step}>{step} / {steps}</span>}
            </div>
            {step && (
                <div className={styles.progress} role="progressbar" aria-valuemin={1} aria-valuemax={steps} aria-valuenow={step}>
                    {Array.from({ length: steps }, (_, i) => (
                        <span key={i} className={`${styles.segment} ${i < step ? styles.done : ""}`} />
                    ))}
                </div>
            )}
        </header>
    );
}
