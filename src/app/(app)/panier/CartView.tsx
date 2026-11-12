"use client";

import { Gift } from "lucide-react";
import { useApp } from "@/components/AppState/AppState";
import Button from "@/components/Button/Button";
import { useCartFlow } from "@/components/CartFlow/CartFlow";
import { isBlocked, resolveCart, totals } from "@/components/CartFlow/pricing";
import CartLineRow from "@/components/CartLineRow/CartLineRow";
import EmptyState from "@/components/EmptyState/EmptyState";
import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import PromoField from "@/components/PromoField/PromoField";
import OrderSummary from "@/components/OrderSummary/OrderSummary";
import { STORIES_PER_REGION, duration, packFullPrice, packPrice, price } from "@/lib/stories";
import styles from "./panier.module.css";

export default function CartView() {
    const { state, catalog, hydrated, setCart, removeFromCart } = useApp();
    const { promo, setPromo } = useCartFlow();
    const { packOfRegion, regionBySlug, regionName } = catalog;

    const owned = [...state.ownedStories, ...state.gifts];
    const lines = resolveCart(state.cart, owned, catalog);
    const { discount, payable } = totals(lines, promo);
    const blocked = isBlocked(lines);

    // Suggestion : au moins 2 histoires non possédées d'une même région sans le pack
    const suggestions = [...new Set(lines.flatMap((l) => (l.kind === "story" ? [l.story.regionSlug] : [])))].flatMap((slug) => {
        const pack = packOfRegion(slug);
        const same = lines.filter((l) => l.kind === "story" && l.story.regionSlug === slug);
        const inCart = lines.some((l) => l.kind === "pack" && l.pack.id === pack?.id);
        return pack && same.length >= 2 && !inCart ? [{ pack, same }] : [];
    });

    const switchToPack = (packId: string, storyIds: string[]) =>
        setCart((cart) => [...cart.filter((l) => !(l.kind === "story" && storyIds.includes(l.id))), { kind: "pack", id: packId }]);

    return (
        <FlowPage>
            <FlowHeader title="Mon panier" backHref="/histoires/boutique" />

            {!hydrated ? null : lines.length === 0 ? (
                <EmptyState title="Ton panier est vide" text="Ajoute des histoires ou un pack régional pour les écouter sur la route." action={{ label: "Découvrir les histoires", href: "/histoires/boutique" }} />
            ) : (
                <>
                    <ul className={styles.list}>
                        {lines.map((l) =>
                            l.kind === "story" ? (
                                <CartLineRow
                                    key={`story-${l.story.id}`}
                                    title={l.story.title}
                                    meta={`${regionName(l.story.regionSlug)} · ${duration(l.story.durationSec)} · ${l.story.age}`}
                                    cover={regionBySlug(l.story.regionSlug)?.cover ?? null}
                                    price={l.included ? "Incluse" : price(l.price)}
                                    warning={l.ownedIds.length ? "Tu possèdes déjà cette histoire. Retire-la pour continuer." : undefined}
                                    onRemove={() => removeFromCart(l.line)}
                                />
                            ) : (
                                <CartLineRow
                                    key={`pack-${l.pack.id}`}
                                    title={l.pack.title}
                                    meta={`${l.stories.length} histoires · ${regionName(l.pack.regionSlug)}${l.ownedIds.length ? ` · ${l.ownedIds.length} déjà dans ta bibliothèque, déduite${l.ownedIds.length > 1 ? "s" : ""} du prix` : ""}`}
                                    cover={regionBySlug(l.pack.regionSlug)?.cover ?? null}
                                    price={price(l.price)}
                                    badge={`Tu économises ${price(l.full - l.price)}`}
                                    onRemove={() => removeFromCart(l.line)}
                                >
                                    <ul className={styles.packStories}>
                                        {l.stories.map((s) => (
                                            <li key={s.id}>{s.title} · {duration(s.durationSec)}</li>
                                        ))}
                                    </ul>
                                </CartLineRow>
                            ),
                        )}
                    </ul>

                    {suggestions.map(({ pack, same }) => (
                        <section key={pack.id} className={styles.suggestion}>
                            <Gift size={22} />
                            <div className={styles.suggestionTexts}>
                                <p className={styles.suggestionTitle}>Passe au pack</p>
                                <p className={styles.suggestionHint}>
                                    {pack.title} : {STORIES_PER_REGION} histoires (ajoutées au fil du temps) pour {price(packPrice(pack.regionSlug, owned, catalog.stories))} au lieu de {price(packFullPrice(pack.regionSlug, owned, catalog.stories))}, tu économises {price(packFullPrice(pack.regionSlug, owned, catalog.stories) - packPrice(pack.regionSlug, owned, catalog.stories))}
                                </p>
                            </div>
                            <button type="button" className={styles.suggestionButton} onClick={() => switchToPack(pack.id, same.map((l) => (l.kind === "story" ? l.story.id : "")))}>
                                Choisir
                            </button>
                        </section>
                    ))}

                    <PromoField applied={promo} discount={discount} onApply={setPromo} onRemove={() => setPromo(null)} />

                    <OrderSummary
                        items={lines.map((l) => ({ label: l.kind === "story" ? l.story.title : l.pack.title, price: l.price }))}
                        discount={promo ? { label: `Code ${promo}`, amount: discount } : null}
                        total={payable}
                    />

                    <Button label={blocked ? "Retire les histoires déjà possédées" : "Passer au paiement"} link={blocked ? undefined : "/panier/paiement"} transitionTypes={["nav-forward"]} type={blocked ? "deactivated" : "primary"} />
                </>
            )}
        </FlowPage>
    );
}
