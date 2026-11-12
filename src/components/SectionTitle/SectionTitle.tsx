import Link from "next/link";
import styles from "./SectionTitle.module.css";

type SectionTitleProps = {
    title: string;
    subtitle?: string;
    link?: { label: string; href: string };
}

export default function SectionTitle({ title, subtitle, link }: SectionTitleProps) {
    return (
        <div className={styles.root}>
            <div className={styles.texts}>
                <h2 className={styles.title}>{title}</h2>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {link && <Link href={link.href} className={styles.link}>{link.label}</Link>}
        </div>
    )
}
