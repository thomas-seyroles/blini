import type { MouseEvent } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import styles from "./Button.module.css";

type ButtonProps = {
    label: string;
    link?: string;
    transitionTypes?: string[];
    onClick?: (e: MouseEvent<HTMLElement>) => void;
    icon?: LucideIcon;
    type: "primary" | "secondary" | "accent" | "deactivated";
}

export default function Button({ label, link, transitionTypes, onClick, icon: Icon, type }: ButtonProps) {
    const className = `${styles.button} ${styles[type]}`;
    const content = (
        <>
            {Icon && <Icon size={20} />}
            <span>{label}</span>
        </>
    );
    return link
        ? <Link href={link} transitionTypes={transitionTypes} onClick={onClick} className={className}>{content}</Link>
        : <button type="button" onClick={onClick} disabled={type === "deactivated"} className={className}>{content}</button>;
}
