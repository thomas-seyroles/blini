import Image from "next/image";
import { CircleCheck } from "lucide-react";
import styles from "./LinkedAccountRow.module.css";

type LinkedAccountRowProps = {
    service: string;
    logo: string;
    linked: boolean;
    status: string;
    canUnlink: boolean;
    onLink: () => void;
    onUnlink: () => void;
}

export default function LinkedAccountRow({ service, logo, linked, status, canUnlink, onLink, onUnlink }: LinkedAccountRowProps) {
    return (
        <li className={styles.root}>
            <Image className={styles.logo} src={logo} alt="" width={44} height={44} />
            <span className={styles.texts}>
                <span className={styles.service}>{service}</span>
                <span className={styles.status}>{status}</span>
            </span>
            {linked ? (
                <span className={styles.side}>
                    <span className={styles.linked}><CircleCheck size={18} />Lié</span>
                    <button
                        type="button"
                        className={styles.unlink}
                        onClick={onUnlink}
                        disabled={!canUnlink}
                        title={canUnlink ? undefined : "Au moins un compte doit rester lié"}
                    >
                        Délier
                    </button>
                </span>
            ) : (
                <button type="button" className={styles.link} onClick={onLink}>Lier</button>
            )}
        </li>
    );
}
