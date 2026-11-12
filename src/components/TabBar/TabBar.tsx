"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BookOpen, Car, Gift, Mic, User } from "lucide-react";
import styles from "./TabBar.module.css";
import { notchLeft, playEntrance, popActiveIcon, press, release, slideNotch } from "./tabBarAnimations";

gsap.registerPlugin(useGSAP);

// Centre de chaque colonne de la grille (62 62 84 62 62), depuis le bord gauche
const centers = [31, 93, 166, 239, 301];

const tabs = [
    { id: "trajets", label: "Trajets", href: "/", icon: Car },
    { id: "histoires", label: "Histoires", href: "/histoires", icon: BookOpen },
    { id: "raconter", label: "Raconter", href: "/raconter", icon: Mic },
    { id: "cadeaux", label: "Cadeaux", href: "/cadeaux", icon: Gift },
    { id: "compte", label: "Compte", href: "/compte", icon: User },
] as const;

export default function TabBar() {
    const pathname = usePathname();
    const active = tabs.find(({ href }) => (href === "/" ? pathname === "/" || pathname.startsWith("/trajets") : pathname.startsWith(href)))?.id;
    const activeIndex = tabs.findIndex(({ id }) => id === active);

    const root = useRef<HTMLElement>(null);
    const fromLeft = useRef<number | null>(null);
    const mounted = useRef(false);
    const motionOk = useRef(true);

    // Entrée au montage, puis slide FLIP à chaque changement d'onglet
    const { contextSafe } = useGSAP(() => {
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            motionOk.current = true;
            if (!mounted.current) playEntrance(root.current!);
            else if (fromLeft.current !== null) {
                slideNotch(root.current!, fromLeft.current);
                popActiveIcon(root.current!);
            }
            fromLeft.current = null;
            mounted.current = true;
            return () => { motionOk.current = false; };
        });
    }, { scope: root, dependencies: [active], revertOnUpdate: false });

    const tabOf = (e: React.SyntheticEvent) => (e.target as Element).closest("a");
    const onClick = (e: React.MouseEvent) => {
        if (tabOf(e) && motionOk.current) fromLeft.current = notchLeft(root.current!);
    };
    const onDown = (e: React.PointerEvent) => {
        const tab = tabOf(e);
        if (tab && motionOk.current) contextSafe(press)(tab);
    };
    const onUp = (e: React.PointerEvent) => {
        const tab = tabOf(e);
        if (!tab || !motionOk.current || tab.contains(e.relatedTarget as Node)) return;
        contextSafe(release)(tab);
    };

    return (
        <nav
            ref={root}
            className={styles.root}
            onClickCapture={onClick}
            onPointerDown={onDown}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onPointerOut={onUp}
        >
            <span className={styles.clip} aria-hidden="true">
                {activeIndex >= 0 && (
                    <span key={active} data-notch className={styles.notch} style={{ left: `calc(50% - 191px + ${centers[activeIndex]}px)` }}>
                        <span data-blob className={styles.blob}>
                            <svg width="50" height="13" viewBox="0 0 49.37 13.03" preserveAspectRatio="none">
                                <path d="M0 0C2.95 0 4.65 1.41 6.01 3.46C7.98 6.46 10.55 9.2 14.21 10.89C17.28 12.31 20.97 13.03 24.69 13.03C28.4 13.03 32.09 12.31 35.16 10.89C38.83 9.2 41.39 6.46 43.36 3.46C44.72 1.41 46.42 0 49.37 0H0Z" fill="currentColor" />
                            </svg>
                        </span>
                    </span>
                )}
            </span>
            {tabs.map(({ id, label, href, icon: Icon }) => {
                const isActive = id === active;
                const isMain = id === "raconter";
                return (
                    <Link
                        key={id}
                        href={isMain && pathname === "/raconter" ? "/raconter/enregistrement" : href}
                        className={`${styles.tab} ${isActive ? styles.active : ""} ${isMain ? styles.main : ""}`}
                        aria-current={isActive ? "page" : undefined}
                    >
                        {isMain ? <span className={styles.mic}><Icon size={32} data-icon /></span> : <Icon size={26} data-icon />}
                        <span className={styles.label}>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
