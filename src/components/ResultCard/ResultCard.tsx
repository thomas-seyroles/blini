"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Headphones, Star } from "lucide-react";
import { eur, placesLabel, type Journey } from "@/lib/journeys";
import InfoDialog from "../InfoDialog/InfoDialog";
import styles from "./ResultCard.module.css";

const dir = "/images/decors";

const INFOS = {
    bluni: { title: "Trajet certifié Bluni", text: "Le conducteur est vérifié (trajets effectués, bons avis), il a accepté le règlement Bluni et au moins un compte BlaBlaCar ou Lunii est lié. Tu peux y raconter et écouter des anecdotes en toute confiance." },
    casque: { title: "Casque Lunii à bord", text: "Le conducteur prête un casque Lunii aux enfants pour écouter les histoires des régions traversées, sans déranger le trajet." },
};

type ResultCardProps = {
    journey: Journey;
    href: string;
    onChoose?: () => void;
}

export default function ResultCard({ journey, href, onChoose }: ResultCardProps) {
    const { kind, driver } = journey;
    const standard = kind === "standard";
    const complet = kind === "complet";
    const certified = !standard;
    const [info, setInfo] = useState<keyof typeof INFOS | null>(null);

    return (
        <li className={`${styles.root} ${styles[kind] ?? ""}`}>
            <div className={styles.top}>
                <div className={styles.times}>
                    <p className={styles.hours}>
                        <span>{journey.departTime}</span>
                        <span className={styles.arrow}>→</span>
                        <span>{journey.arrivalTime}</span>
                    </p>
                    <p className={styles.duration}>{journey.duration} de trajet</p>
                </div>
                <div className={styles.price}>
                    <p className={styles.amount}>{eur(journey.price)}</p>
                    <p className={styles.seats}>{complet ? "Complet" : placesLabel(journey.seatsLeft)}</p>
                </div>
            </div>
            <div className={styles.places}>
                <Image src={`${dir}/trace-resultat.svg`} alt="" width={10} height={41} />
                <div className={styles.stops}>
                    <p>{journey.from}</p>
                    <p>{journey.to}</p>
                </div>
            </div>
            <Image
                className={styles.dots}
                src={`${dir}/${kind === "certifie" ? "pointilles-violet" : "pointilles-jaune"}.svg`}
                alt=""
                width={354}
                height={2}
            />
            <div className={styles.bottom}>
                <div className={styles.photo}>
                    <Image src={driver.photo} alt="" width={34} height={34} />
                </div>
                <div className={styles.driver}>
                    <p className={styles.name}>{driver.name} · {driver.car}</p>
                    <p className={styles.rating}>
                        <Star className={styles.star} size={12} />
                        {driver.rating} · {driver.reviews} avis
                    </p>
                </div>
                {certified && (
                    <div className={styles.gear}>
                        <button type="button" className={styles.logo} onClick={() => setInfo("bluni")} aria-label="Trajet certifié Bluni : en savoir plus">
                            <Image src="/images/logos/bluni.webp" alt="" width={22} height={22} />
                        </button>
                        <button type="button" className={styles.headset} onClick={() => setInfo("casque")} aria-label="Casque Lunii à bord : en savoir plus">
                            <Headphones size={16} />
                        </button>
                    </div>
                )}
            </div>
            <InfoDialog open={!!info} title={info ? INFOS[info].title : ""} text={info ? INFOS[info].text : ""} onClose={() => setInfo(null)} />
            {complet ? (
                <span className={styles.action}>Complet</span>
            ) : (
                <Link href={href} transitionTypes={["nav-forward"]} onClick={onChoose} className={styles.action}>
                    Choisir ce trajet
                    <ArrowRight size={18} />
                </Link>
            )}
        </li>
    );
}
