"use client";

import { useApp } from "@/components/AppState/AppState";
import SettingRow from "@/components/SettingRow/SettingRow";
import { BookOpen, Bell, Car, Gift, Mic } from "lucide-react";
import { flag, setSetting } from "@/lib/account";

const OPTIONS = [
    { key: "notifAnecdotes", icon: Mic, title: "Suivi de mes anecdotes", subtitle: "Écoute, sélection, écriture, publication" },
    { key: "notifTrajets", icon: Car, title: "Rappels de trajet", subtitle: "La veille et une heure avant le départ" },
    { key: "notifCadeaux", icon: Gift, title: "Points et cadeaux", subtitle: "Bonus de validation, récompenses disponibles" },
    { key: "notifHistoires", icon: BookOpen, title: "Nouvelles histoires de ma région", subtitle: "Dès qu’une histoire est publiée" },
];

export default function NotificationSettings() {
    const { state, update } = useApp();
    const master = flag(state, "notifications");
    return (
        <div>
            <SettingRow
                icon={Bell}
                title="Toutes les notifications"
                subtitle={master ? "Activées" : "Désactivées : aucune alerte ne sera envoyée"}
                toggle={{ checked: master, onChange: (v) => update(setSetting("notifications", v)) }}
            />
            {OPTIONS.map(({ key, icon, title, subtitle }) => (
                <SettingRow
                    key={key}
                    icon={icon}
                    title={title}
                    subtitle={subtitle}
                    toggle={{ checked: master && flag(state, key), onChange: (v) => update(setSetting(key, v)) }}
                />
            ))}
        </div>
    );
}
