"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Mic, Truck, X } from "lucide-react";
import { eur } from "@/lib/journeys";
import { CONTEUSE_DISCOUNT, CONTEUSE_PRICE, CONTEUSE_REGULAR_PRICE, packageStatus } from "@/lib/package";
import { claimPackage } from "@/server/actions/package";
import { useApp } from "../AppState/AppState";
import Button from "../Button/Button";
import Field from "../Field/Field";
import FlowHeader from "../FlowHeader/FlowHeader";
import FlowPage from "../FlowPage/FlowPage";
import flow from "../FlowPage/FlowPage.module.css";
import PaymentMethods, { type SavedCard } from "../PaymentMethods/PaymentMethods";
import TotalCard from "../TotalCard/TotalCard";
import styles from "./PackageFlow.module.css";

const STEPS = ["Adresse", "Compteuse", "Paiement"];

export default function PackageFlow() {
    const router = useRouter();
    const { state } = useApp();
    const status = packageStatus(state);
    const [step, setStep] = useState(1);
    const [done, setDone] = useState(false);
    const [address, setAddress] = useState({ recipient: `${state.profile.firstName} ${state.profile.lastName}`.trim(), street: "", postalCode: "", city: "" });
    const [conteuse, setConteuse] = useState(false);
    const [cards, setCards] = useState<SavedCard[]>([{ id: "card-4242", last4: "4242", expiry: "09/28" }]);
    const [method, setMethod] = useState("card-4242");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState("");
    const [paying, setPaying] = useState(false);

    // Non éligible : le serveur refuse aussi la commande, ceci évite seulement un écran inutile
    useEffect(() => {
        if (!status.eligible) router.replace("/compte");
    }, [status.eligible, router]);
    if (!status.eligible) return null;

    const order = state.packageOrder;
    if (order || done) return <Confirmation conteuse={order?.conteuse ?? conteuse} address={order ?? address} />;

    const total = conteuse ? CONTEUSE_PRICE : 0;
    const set = (key: keyof typeof address) => (value: string) => setAddress((a) => ({ ...a, [key]: value }));

    const next = () => {
        if (step === 1) {
            const e: Record<string, string> = {};
            if (!address.recipient.trim()) e.recipient = "Indique le nom du destinataire";
            if (!address.street.trim()) e.street = "Indique ton adresse";
            if (!/^\d{5}$/.test(address.postalCode)) e.postalCode = "Code postal à 5 chiffres";
            if (!address.city.trim()) e.city = "Indique ta ville";
            setErrors(e);
            if (Object.keys(e).length) return;
        }
        setStep(step + 1);
    };

    const pay = async () => {
        setPaying(true);
        setError("");
        const result = await claimPackage({ ...address, conteuse });
        if (!result.ok) {
            setPaying(false);
            setError(result.error ?? "La commande n’a pas abouti.");
            return;
        }
        setDone(true);
    };

    return (
        <FlowPage>
            <FlowHeader title={STEPS[step - 1]} backHref="/compte" step={step} steps={STEPS.length} onBack={step > 1 ? () => setStep(step - 1) : undefined} />

            {step === 1 && (
                <>
                    <section className={`${flow.box} ${flow.boxYellow} ${styles.offer}`}>
                        <Image src="/images/mascottes/voiture.webp" alt="" width={72} height={72} />
                        <div>
                            <h2 className={flow.heading}>Ton package Lunii est offert</h2>
                            <p className={styles.hint}>Boîtier enregistreur à fixer dans ta voiture pour raconter tes anecdotes mains libres. Livraison offerte.</p>
                        </div>
                    </section>
                    <h2 className={flow.heading}>Adresse de livraison</h2>
                    <Field label="Destinataire" value={address.recipient} onChange={set("recipient")} error={errors.recipient} maxLength={120} />
                    <Field label="Adresse" value={address.street} onChange={set("street")} placeholder="12 rue des Lilas" error={errors.street} maxLength={200} />
                    <div className={styles.row}>
                        <Field label="Code postal" value={address.postalCode} onChange={(v) => set("postalCode")(v.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" error={errors.postalCode} maxLength={5} />
                        <Field label="Ville" value={address.city} onChange={set("city")} error={errors.city} maxLength={100} />
                    </div>
                    <Button label="Continuer" onClick={next} type="primary" />
                </>
            )}

            {step === 2 && (
                <>
                    <h2 className={flow.heading}>Ajoute une conteuse Lunii</h2>
                    <button type="button" role="switch" aria-checked={conteuse} className={`${styles.conteuse} ${conteuse ? styles.selected : ""}`} onClick={() => setConteuse(!conteuse)}>
                        <span className={styles.badge}>−{CONTEUSE_DISCOUNT} %</span>
                        <span className={styles.conteuseTitle}>Conteuse Lunii</span>
                        <span className={styles.prices}>
                            <strong>+{eur(CONTEUSE_PRICE)}</strong>
                            <s>{eur(CONTEUSE_REGULAR_PRICE)}</s>
                        </span>
                        <span className={styles.hint}>Offre réservée aux conducteurs Bluni : {CONTEUSE_DISCOUNT} % de moins que le prix habituel de {eur(CONTEUSE_REGULAR_PRICE)} sur Lunii.</span>
                        <span className={styles.radio}>{conteuse && <Check size={14} />}</span>
                    </button>
                    <Button label={conteuse ? "Ajouter la conteuse" : "Continuer sans conteuse"} onClick={next} type="primary" />
                </>
            )}

            {step === 3 && (
                <>
                    <TotalCard amount={total ? eur(total) : "Gratuit"} summary={conteuse ? "Package + conteuse Lunii · livraison offerte" : "Package Lunii · livraison offerte"} label="Total" />
                    <ul className={`${flow.box} ${styles.lines}`}>
                        <li><span>Package Lunii (enregistreur audio)</span><span>Offert</span></li>
                        <li><span>Livraison</span><span>Offerte</span></li>
                        {conteuse && <li><span>Conteuse Lunii (−{CONTEUSE_DISCOUNT} %)</span><span>{eur(CONTEUSE_PRICE)}</span></li>}
                    </ul>
                    <p className={styles.hint}>Livré à {address.recipient}, {address.street}, {address.postalCode} {address.city}</p>
                    {total > 0 && (
                        <>
                            <h2 className={flow.heading}>Moyen de paiement</h2>
                            <PaymentMethods cards={cards} selectedId={method} onSelect={setMethod} onAddCard={(c) => { setCards([...cards, c]); setMethod(c.id); }} />
                        </>
                    )}
                    <Button label={paying ? "Commande en cours…" : total ? `Payer ${eur(total)}` : "Confirmer ma commande"} onClick={pay} type={paying ? "deactivated" : "primary"} />
                    {error && <p className={flow.error} role="alert">{error}</p>}
                </>
            )}
        </FlowPage>
    );
}

function Confirmation({ conteuse, address }: { conteuse: boolean; address: { recipient: string; street: string; postalCode: string; city: string } }) {
    return (
        <FlowPage>
            <div className={styles.top}>
                <Link href="/compte" transitionTypes={["nav-back"]} className={styles.close} aria-label="Fermer"><X size={16} /></Link>
            </div>
            <Image className={styles.mascot} src="/images/mascottes/casque.webp" alt="" width={137} height={150} priority />
            <h1 className={styles.title}>Ton package est en route !</h1>
            <ul className={`${flow.box} ${styles.recap}`}>
                <li><Truck size={16} /><span>{address.recipient}, {address.street}, {address.postalCode} {address.city}</span></li>
                <li><Mic size={16} /><span>Enregistreur audio{conteuse ? " + conteuse Lunii" : ""}</span></li>
            </ul>
            <Button label="Retour à mon compte" link="/compte" transitionTypes={["nav-back"]} type="primary" />
        </FlowPage>
    );
}
