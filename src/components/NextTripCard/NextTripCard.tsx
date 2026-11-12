import Image from "next/image";
import Link from "next/link";
import { Headphones } from "lucide-react";
import type { Role, Trip } from "@/lib/trip";
import Button from "../Button/Button";
import SectionTitle from "../SectionTitle/SectionTitle";
import styles from "./NextTripCard.module.css";

type NextTripCardProps = {
    role: Role;
    trip: Trip | null;
}

export default function NextTripCard({ role, trip }: NextTripCardProps) {
    const isDriver = role === "conducteur";

    if (!trip) {
        return (
            <section className={styles.root}>
                <SectionTitle title="Mon prochain trajet" />
                <div className={`${styles.card} ${styles.empty}`}>
                    <div className={styles.lulu}>
                        <Image src="/images/mascottes/triste.webp" alt="" width={66} height={76} />
                    </div>
                    <h3 className={styles.emptyTitle}>Aucun trajet prévu</h3>
                    <p className={styles.emptyText}>
                        {isDriver
                            ? "Propose un trajet : les passagers pourront réserver une place et écouter tes histoires."
                            : "Réserve un trajet certifié Bluni pour préparer les histoires de la route."}
                    </p>
                    <Button label={isDriver ? "Proposer un trajet" : "Rechercher un trajet"} link="#recherche" type="primary" />
                </div>
            </section>
        );
    }

    return (
        <section className={styles.root}>
            <SectionTitle title="Mon prochain trajet" />
            <div className={`${styles.card} ${isDriver ? styles.violet : ""}`}>
                {trip.href && <Link href={trip.href} transitionTypes={["nav-forward"]} className={styles.cover} aria-label="Voir le détail du trajet" />}
                <p className={styles.date}>{trip.date}</p>
                <div className={styles.route}>
                    <span className={styles.city}>{trip.from}</span>
                    <Image src={isDriver ? "/images/decors/route-violet.svg" : "/images/decors/route.svg"} alt="" width={110} height={14} />
                    <span className={styles.city}>{trip.to}</span>
                </div>
                {isDriver ? (
                    <div className={styles.driver}>
                        <div className={styles.avatars}>
                            {(trip.passengers ?? []).slice(0, 2).map((name, i) => (
                                <span key={name} className={`${styles.avatar} ${i ? styles.avatarT : styles.avatarL}`}>{name[0]}</span>
                            ))}
                            {(trip.seatsFree ?? 0) > 0 && <span className={`${styles.avatar} ${styles.free}`}>+</span>}
                        </div>
                        <div>
                            <p className={styles.driverName}>{trip.companions}</p>
                            <p className={styles.seatInfo}>{trip.seatInfo}</p>
                        </div>
                    </div>
                ) : (
                    <div className={styles.driver}>
                        <div className={styles.photo}>
                            {trip.photo && <Image src={trip.photo} alt="" width={40} height={40} />}
                            <span className={styles.headset}><Headphones size={12} /></span>
                        </div>
                        <div>
                            <p className={styles.driverName}>{trip.driver}</p>
                            <p className={styles.headsetInfo}>{trip.headsetInfo}</p>
                        </div>
                    </div>
                )}
                <hr className={styles.separator} />
                <div className={styles.cta}>
                    {isDriver
                        ? <Button label="Préparer les histoires du trajet" link={trip.playlistHref ?? "/histoires/bibliotheque"} transitionTypes={["nav-forward"]} type="primary" />
                        : <Button label="Préparer les histoires" link={trip.playlistHref ?? "/histoires/bibliotheque"} transitionTypes={["nav-forward"]} type="accent" />}
                </div>
            </div>
        </section>
    )
}
