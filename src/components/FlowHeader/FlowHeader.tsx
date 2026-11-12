"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useBack } from "@/lib/navHistory";
import styles from "./FlowHeader.module.css";

type FlowHeaderProps = {
    title: string;
    backHref: string;
    step?: number;
    steps?: number;
    onBack?: () => void;
}

export default function FlowHeader({ title, backHref, step, steps = 4, onBack }: FlowHeaderProps) {
    const goBack = useBack(backHref);
    return (
        <header className={styles.root}>
            <div className={styles.bar}>
                {onBack ? (
                    <button type="button" onClick={onBack} className={styles.back} aria-label="Retour">
                        <ArrowLeft size={20} />
                    </button>
                ) : (
                    <Link href={backHref} onClick={goBack} className={styles.back} aria-label="Retour">
                        <ArrowLeft size={20} />
                    </Link>
                )}
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
