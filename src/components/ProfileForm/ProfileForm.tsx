"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button/Button";
import Field from "@/components/Field/Field";
import { useApp } from "@/components/AppState/AppState";
import { isEmail } from "@/lib/account";
import { updateProfile } from "@/server/actions/account";

export default function ProfileForm() {
    const { state, setFlash } = useApp();
    const router = useRouter();
    const [form, setForm] = useState(state.profile);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const set = (key: "firstName" | "lastName" | "email") => (value: string) => setForm((f) => ({ ...f, [key]: value }));

    const save = async () => {
        const next: Record<string, string> = {};
        if (!form.firstName.trim()) next.firstName = "Indique ton prénom.";
        if (!form.lastName.trim()) next.lastName = "Indique ton nom.";
        if (!isEmail(form.email)) next.email = "Adresse e-mail invalide.";
        setErrors(next);
        if (Object.keys(next).length) return;
        const result = await updateProfile(form);
        if (!result.ok) return setErrors({ email: result.error ?? "Enregistrement impossible." });
        setFlash("Profil enregistré.");
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
