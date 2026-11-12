import Image from "next/image";
import Link from "next/link";
import styles from "./RegionTile.module.css";

type RegionTileProps = {
    region: string;
    count: string;
    cover: string | null;
    href: string;
}

export default function RegionTile({ region, count, cover, href }: RegionTileProps) {
    return (
        <li className={styles.root}>
            <Link href={href} transitionTypes={["nav-forward"]} className={styles.link}>
                <Image className={styles.visual} src={cover ?? "/images/items/collection.webp"} alt="" width={280} height={396} sizes="140px" />
                <span className={styles.region}>{region}</span>
                <span className={styles.count}>{count}</span>
            </Link>
        </li>
    )
}
