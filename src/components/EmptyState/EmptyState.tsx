import Image from "next/image";
import Button from "../Button/Button";
import styles from "./EmptyState.module.css";

type EmptyStateProps = {
    title: string;
    text: string;
    action?: { label: string; href: string };
}

export default function EmptyState({ title, text, action }: EmptyStateProps) {
    return (
        <section className={styles.root}>
            <Image src="/images/mascotte-triste.png" alt="" width={66} height={76} />
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.text}>{text}</p>
            {action && <Button label={action.label} link={action.href} type="primary" />}
        </section>
    );
}
