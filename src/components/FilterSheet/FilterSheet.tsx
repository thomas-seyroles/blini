"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SlidersHorizontal, X } from "lucide-react";
import { PRICE_MAX, PRICE_MIN, activeCount, defaultFilters, slots, sorts, type Filters } from "@/lib/filters";
import styles from "./FilterSheet.module.css";

gsap.registerPlugin(useGSAP);

const dir = "/images/filtres";

const options = [
    { id: "certifies", label: "Certifiés Bluni", hint: "Profils vérifiés, règlement accepté" },
    { id: "casque", label: "Casque Lunii à bord", hint: "Prêté par le conducteur" },
    { id: "siege", label: "Siège enfant", hint: "Disponible sur demande" },
] as const;

type FilterSheetProps = {
    filters: Filters;
    onChange: (filters: Filters) => void;
    count: number;
}

export default function FilterSheet({ filters, onChange: setFilters, count: results }: FilterSheetProps) {
    const [open, setOpen] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    const closeButton = useRef<HTMLButtonElement>(null);
    const timeline = useRef<gsap.core.Timeline | null>(null);

    const count = activeCount(filters);
    const close = () => setOpen(false);

    // Ouverture depuis le bas : voile, feuille, puis mascotte et étincelles
    useGSAP(() => {
        const q = gsap.utils.selector(root);
        timeline.current = gsap
            .timeline({ paused: true, defaults: { ease: "power3.out" } })
            .set(root.current, { autoAlpha: 1 }, 0)
            .fromTo(q("[data-veil]"), { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, 0)
            .fromTo(q("[data-panel]"), { yPercent: 100 }, { yPercent: 0, duration: 0.55 }, 0)
            .fromTo(q("[data-mascot]"), { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(1.7)" }, 0.3)
            .fromTo(q("[data-sparkle]"), { scale: 0, rotate: -60 }, { scale: 1, rotate: 0, duration: 0.45, stagger: 0.08, ease: "back.out(2.5)" }, 0.45);
    }, { scope: root });

    useEffect(() => {
        const tl = timeline.current;
        if (!tl) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!open) {
            tl.timeScale(reduced ? 50 : 1.6).reverse();
            return;
        }
        tl.timeScale(reduced ? 50 : 1).play();
        closeButton.current?.focus();
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <>
            <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
                <SlidersHorizontal size={16} />
                Filtrer
                {count > 0 && <span className={styles.count}>{count}</span>}
            </button>

            <div ref={root} className={styles.root} data-open={open || undefined} inert={!open}>
                <button type="button" data-veil className={styles.veil} onClick={close} aria-label="Fermer les filtres" tabIndex={-1} />
                <div data-panel className={styles.panel}>
                    <Image data-mascot className={styles.mascot} src="/images/mascotte-casque.png" alt="" width={106} height={116} />
                    <Image data-sparkle className={styles.sparkleLarge} src={`${dir}/etincelle-grande.svg`} alt="" width={36} height={36} />
                    <Image data-sparkle className={styles.sparkleMedium} src={`${dir}/etincelle-moyenne.svg`} alt="" width={19} height={19} />
                    <Image data-sparkle className={styles.sparkleSmall} src={`${dir}/etincelle-petite.svg`} alt="" width={12} height={12} />

                    <div className={styles.sheet} role="dialog" aria-modal="true" aria-label="Filtres">
                        <span className={styles.handle} />
                        <div className={styles.header}>
                            <div>
                                <h2 className={styles.title}>Filtres</h2>
                                <p className={styles.subtitle}>Trouve le trajet qui te ressemble</p>
                            </div>
                            <button ref={closeButton} type="button" className={styles.close} onClick={close} aria-label="Fermer">
                                <X size={14} />
                            </button>
                        </div>

                        <section className={styles.group}>
                            <h3 className={styles.label}>Trier par</h3>
                            <div className={styles.chips}>
                                {sorts.map(({ id, label }) => (
                                    <button
                                        key={id}
                                        type="button"
                                        className={`${styles.chip} ${filters.sort === id ? styles.chipActive : ""}`}
                                        aria-pressed={filters.sort === id}
                                        onClick={() => setFilters({ ...filters, sort: id })}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className={styles.group}>
                            <h3 className={styles.label}>Trajet Bluni</h3>
                            {options.map(({ id, label, hint }) => (
                                <button
                                    key={id}
                                    type="button"
                                    role="switch"
                                    aria-checked={filters.on[id]}
                                    className={styles.option}
                                    onClick={() => setFilters({ ...filters, on: { ...filters.on, [id]: !filters.on[id] } })}
                                >
                                    <span className={styles.optionTexts}>
                                        <span className={styles.optionLabel}>{label}</span>
                                        <span className={styles.optionHint}>{hint}</span>
                                    </span>
                                    <span className={styles.switch} />
                                </button>
                            ))}
                        </section>

                        <section className={styles.group}>
                            <h3 className={styles.label}>Heure de départ</h3>
                            <div className={styles.chips}>
                                {slots.map(({ id, label }) => (
                                    <button
                                        key={id}
                                        type="button"
                                        className={`${styles.chip} ${filters.slot === id ? styles.chipActive : ""}`}
                                        aria-pressed={filters.slot === id}
                                        onClick={() => setFilters({ ...filters, slot: filters.slot === id ? null : id })}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className={styles.group}>
                            <div className={styles.priceHeader}>
                                <label htmlFor="prix-max" className={styles.label}>Prix max</label>
                                <output htmlFor="prix-max" className={styles.price}>{filters.price} €</output>
                            </div>
                            <input
                                id="prix-max"
                                type="range"
                                className={styles.range}
                                min={PRICE_MIN}
                                max={PRICE_MAX}
                                value={filters.price}
                                style={{ "--p": (filters.price - PRICE_MIN) / (PRICE_MAX - PRICE_MIN) } as React.CSSProperties}
                                onChange={(e) => setFilters({ ...filters, price: Number(e.target.value) })}
                            />
                            <div className={styles.bounds}>
                                <span>{PRICE_MIN} €</span>
                                <span>{PRICE_MAX} €</span>
                            </div>
                        </section>

                        <div className={styles.actions}>
                            <button type="button" className={styles.clear} onClick={() => setFilters(defaultFilters)}>Tout effacer</button>
                            <button type="button" className={styles.apply} onClick={close}>Voir {results} trajet{results > 1 ? "s" : ""}</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
