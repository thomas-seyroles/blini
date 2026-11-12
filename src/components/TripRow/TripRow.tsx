import Image from "next/image";
import Link from "next/link";
import styles from "./TripRow.module.css";

type TripRowProps = {
    route: string;
    meta: string;
    badge: string;
    points?: boolean;
    href?: string;
}

export default function TripRow({ route, meta, badge, points, href }: TripRowProps) {
    const content = (
        <>
            <div className={styles.texts}>
                <p className={styles.route}>{route}</p>
                <p className={styles.meta}>{meta}</p>
            </div>
            <span className={`${styles.badge} ${points ? styles.points : ""}`}>
                {badge}
                {points && <Image src="/images/icones/points.svg" alt="" width={15} height={15} />}
            </span>
        </>
    );
    return (
        <li className={styles.root}>
            {href
                ? <Link href={href} transitionTypes={["nav-forward"]} className={styles.inner}>{content}</Link>
                : <div className={styles.inner}>{content}</div>}
        </li>
    )
}
