import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import Switch from "../Switch/Switch";
import styles from "./SettingRow.module.css";

type SettingRowProps = {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    value?: ReactNode;
    href?: string;
    toggle?: { checked: boolean; onChange: (checked: boolean) => void };
}

export default function SettingRow({ icon: Icon, title, subtitle, value, href, toggle }: SettingRowProps) {
    const content = (
        <>
            <span className={styles.pill}><Icon size={20} /></span>
            <span className={styles.texts}>
                <span className={styles.title}>{title}</span>
                {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
            </span>
            {value}
            {href && !toggle && <ChevronRight size={18} className={styles.chevron} />}
        </>
    );
    return (
        <div className={styles.root}>
            {href
                ? <Link href={href} transitionTypes={["nav-forward"]} className={styles.main}>{content}</Link>
                : <div className={styles.main}>{content}</div>}
            {toggle && <Switch checked={toggle.checked} onChange={toggle.onChange} label={title} />}
        </div>
    );
}
