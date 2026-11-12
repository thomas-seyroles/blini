"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button/Button";
import Field from "@/components/Field/Field";
import { useApp } from "@/components/AppState/AppState";
import { isEmail, setSetting } from "@/lib/account";

export default function ProfileForm() {
    const { state, update, hydrated } = useApp();
    const router = useRouter();
    const [form, setForm] = useState(state.profile);
    const [synced, setSynced] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    if (hydrated && !synced) {
        setSynced(true);
        setForm(state.profile);
    }

    const set = (key: "firstName" | "lastName" | "email") => (value: string) => setForm((f) => ({ ...f, [key]: value }));

    const save = () => {
        const next: Record<string, string> = {};
        if (!form.firstName.trim()) next.firstName = "Indique ton prénom.";
        if (!form.lastName.trim()) next.lastName = "Indique ton nom.";
        if (!isEmail(form.email)) next.email = "Adresse e-mail invalide.";
        setErrors(next);
        if (Object.keys(next).length) return;
        update((s) => setSetting("flash", "Profil enregistré.")({
            ...s,
            profile: { ...s.profile, firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim() },
        }));
        router.push("/compte", { transitionTypes: ["nav-back"] });
    };

    return (
        <>
            <Field label="Prénom" value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
            <Field label="Nom" value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
            <Field label="E-mail" type="email" inputMode="email" value={form.email} onChange={set("email")} error={errors.email} />
            <Button type="primary" label="Enregistrer" onClick={save} />
        </>
    );
}
