import { Armchair, Headphones, MessageCircle, Music } from "lucide-react";
import type { Equipment } from "@/lib/journeys";
import styles from "./EquipmentTags.module.css";

const tags = {
    headset: { label: "Casque Lunii à bord", icon: Headphones, violet: true },
    childSeat: { label: "Siège enfant", icon: Armchair, violet: false },
    stories: { label: "Histoires en route", icon: Music, violet: true },
    chat: { label: "Aime discuter", icon: MessageCircle, violet: false },
} as const;

export default function EquipmentTags({ equipments }: { equipments: Equipment[] }) {
    return (
        <ul className={styles.root}>
            {equipments.map((key) => {
                const { label, icon: Icon, violet } = tags[key];
                return (
                    <li key={key} className={`${styles.tag} ${violet ? styles.violet : ""}`}>
                        <Icon size={14} />
                        {label}
                    </li>
                );
            })}
        </ul>
    );
}
