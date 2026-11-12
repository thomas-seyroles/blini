import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Headphones, Star } from "lucide-react";
import { driverById, eur, placesLabel, type Journey } from "@/lib/journeys";
import styles from "./ResultCard.module.css";

const dir = "/images/resultats";

type ResultCardProps = {
    journey: Journey;
    href: string;
    onChoose?: () => void;
}

export default function ResultCard({ journey, href, onChoose }: ResultCardProps) {
    const { kind } = journey;
    const driver = driverById(journey.driverId);
    const standard = kind === "standard";
    const complet = kind === "complet";
    const certified = !standard;

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
                <Image src={`${dir}/trace.svg`} alt="" width={10} height={41} />
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
                <div className={styles.gear}>
                    {certified && (
                        <span className={styles.logo}>
                            <Image src="/images/logo-bluni.png" alt="Trajet certifié Bluni" width={22} height={22} />
                        </span>
                    )}
                    <span className={styles.headset}>
                        <Headphones size={16} aria-label="Casque Lunii à bord" />
                    </span>
                </div>
            </div>
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
