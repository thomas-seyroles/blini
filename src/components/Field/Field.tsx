import type { ReactNode } from "react";
import styles from "./Field.module.css";

type FieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    multiline?: boolean;
    icon?: ReactNode;
    error?: string | null;
    type?: string;
    inputMode?: "text" | "numeric" | "email" | "tel";
    maxLength?: number;
}

export default function Field({ label, value, onChange, placeholder, multiline, icon, error, type = "text", inputMode, maxLength }: FieldProps) {
    const props = {
        className: styles.input,
        value,
        placeholder,
        maxLength,
        "aria-invalid": !!error,
        onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    };

    return (
        <label className={styles.root}>
            <span className={styles.label}>{label}</span>
            <span className={`${styles.field} ${multiline ? styles.multiline : ""} ${error ? styles.invalid : ""}`}>
                {icon}
                {multiline ? <textarea rows={4} {...props} /> : <input type={type} inputMode={inputMode} {...props} />}
            </span>
            {error && <span className={styles.error} role="alert">{error}</span>}
        </label>
    );
}
