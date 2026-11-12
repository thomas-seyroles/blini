"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useApp } from "../AppState/AppState";
import styles from "./CartButton.module.css";

export default function CartButton() {
    const { state } = useApp();
    const count = state.cart.length;

    return (
        <Link
            href="/panier"
            transitionTypes={["nav-forward"]}
            className={`${styles.root} ${count > 0 ? styles.filled : ""}`}
            aria-label={count > 0 ? `Panier, ${count} article${count > 1 ? "s" : ""}` : "Panier"}
        >
            <ShoppingCart size={20} />
            {count > 0 && <span className={styles.badge}>{count}</span>}
        </Link>
    );
}
