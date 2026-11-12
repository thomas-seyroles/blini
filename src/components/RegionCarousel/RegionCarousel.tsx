import RegionTile from "../RegionTile/RegionTile";
import styles from "./RegionCarousel.module.css";

type RegionCarouselProps = {
    regions: { slug: string; region: string; count: string; cover: string | null; href: string }[];
}

export default function RegionCarousel({ regions }: RegionCarouselProps) {
    return (
        <ul className={styles.track}>
            {regions.map((r) => <RegionTile key={r.slug} {...r} />)}
        </ul>
    )
}
