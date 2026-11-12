import { Check } from "lucide-react";
import styles from "./CheckOption.module.css";

type CheckOptionProps = {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export default function CheckOption({ label, checked, onChange }: CheckOptionProps) {
    return (
        <label className={styles.root}>
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <span className={styles.box}><Check size={16} /></span>
            {label}
        </label>
    );
}
