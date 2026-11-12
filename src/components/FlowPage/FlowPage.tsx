import type { ReactNode } from "react";
import PageTransition from "../PageTransition/PageTransition";
import styles from "./FlowPage.module.css";

export default function FlowPage({ children }: { children: ReactNode }) {
    return (
        <PageTransition>
            <main className={styles.page}>{children}</main>
        </PageTransition>
    );
}
