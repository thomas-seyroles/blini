"use client";

import { Check } from "lucide-react";
import { useApp } from "@/components/AppState/AppState";
import flow from "@/components/FlowPage/FlowPage.module.css";
import { choice } from "@/lib/account";
import { saveSetting } from "@/server/actions/account";
import styles from "./ChoiceSetting.module.css";

type ChoiceSettingProps = {
    settingKey: string;
    fallback: string;
    options: Record<string, string>;
    note?: string;
}

export default function ChoiceSetting({ settingKey, fallback, options, note }: ChoiceSettingProps) {
    const { state } = useApp();
    const current = choice(state, settingKey, fallback);
    return (
        <>
            <div className={`${flow.box} ${styles.list}`} role="radiogroup">
                {Object.entries(options).map(([id, label]) => (
                    <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={current === id}
                        className={styles.option}
                        onClick={() => saveSetting(settingKey, id)}
                    >
                        {label}
                        {current === id && <Check size={18} />}
                    </button>
                ))}
            </div>
            {note && <p className={styles.note}>{note}</p>}
        </>
    );
}
