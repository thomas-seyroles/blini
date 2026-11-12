"use client";

import { useApp } from "@/components/AppState/AppState";
import EmptyState from "@/components/EmptyState/EmptyState";
import ItemCard from "@/components/ItemCard/ItemCard";
import styles from "./ItemShop.module.css";

// Grille d’items : boutique complète, ou uniquement les items obtenus
export default function ItemShop({ onlyOwned }: { onlyOwned?: boolean }) {
    const { state, catalog } = useApp();
    const { items } = catalog;
    const list = onlyOwned ? items.filter((i) => state.inventory.includes(i.id)) : items;

    if (!list.length) {
        return <EmptyState title="Aucun item pour l’instant" text="Échange tes points dans la boutique pour remplir ta collection." action={{ label: "Voir la boutique", href: "/cadeaux" }} />;
    }
    return (
        <ul className={styles.grid}>
            {list.map((item) => <ItemCard wide={item.id === "conteuse-bluni"} key={item.id} item={item} points={state.points} owned={state.inventory.includes(item.id)} />)}
        </ul>
    );
}
