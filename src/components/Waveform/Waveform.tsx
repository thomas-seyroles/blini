import styles from "./Waveform.module.css";

const heights = [18, 30, 44, 26, 58, 36, 64, 40, 22, 50, 68, 46, 30, 56, 38, 24, 48, 62, 34, 20, 42, 54, 28, 16, 36, 52, 30, 18];

type WaveformProps = {
    // part jouée de l'onde, entre 0 et 1
    progress?: number;
    animated?: boolean;
    // alterne violet et jaune (enregistrement)
    colorful?: boolean;
    // hauteur maximale en px
    height?: number;
}

export default function Waveform({ progress = 1, animated, colorful, height = 72 }: WaveformProps) {
    const played = Math.round(progress * heights.length);
    return (
        <div className={styles.root} style={{ height }} aria-hidden="true">
            {heights.map((h, i) => (
                <span
                    key={i}
                    className={`${styles.bar} ${i < played ? (colorful && i % 3 === 0 ? styles.yellow : styles.played) : ""} ${animated ? styles.animated : ""}`}
                    style={{ height: `${(h / 68) * 100}%`, animationDelay: `${-(i * 137) % 900}ms` }}
                />
            ))}
        </div>
    );
}
