import gsap from "gsap";

// Transform et opacity uniquement : pas de layout, GPU friendly
const EASE = {
    pop: "back.out(2.2)",
    release: "elastic.out(1, 0.5)",
    slide: "power2.inOut",
};

// Déformation de l'encoche selon la vitesse (px par frame)
const SKEW_PER_PX = 3.5;
const SKEW_MAX = 35;
const STRETCH_PER_PX = 0.07;
const STRETCH_MAX = 0.8;
const SQUASH_PER_PX = 0.03;
const SQUASH_MAX = 0.4;

const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v));

export function playEntrance(root: HTMLElement) {
    const notch = root.querySelector("[data-notch]");
    const icon = root.querySelector("[aria-current] [data-icon]");

    const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
    if (notch) tl.from(notch, { y: -10, autoAlpha: 0, duration: 0.45, ease: EASE.pop }, 0);
    if (icon) tl.from(icon, { y: 8, scale: 0.7, duration: 0.5, ease: EASE.pop }, 0.05);
    return tl;
}

export function popActiveIcon(root: HTMLElement) {
    const icon = root.querySelector("[aria-current] [data-icon]");
    if (icon) gsap.from(icon, { y: 8, scale: 0.7, duration: 0.5, ease: EASE.pop, overwrite: "auto" });
}

// Position viewport de l'encoche (la nav est fixed : on évite toute compensation du scroll)
export function notchLeft(root: HTMLElement) {
    return root.querySelector("[data-notch]")?.getBoundingClientRect().left ?? null;
}

// Slide de l'encoche depuis son ancienne position (FLIP manuel) + déformation selon la vitesse
export function slideNotch(root: HTMLElement, fromLeft: number) {
    const notch = root.querySelector<HTMLElement>("[data-notch]");
    const blob = notch?.querySelector<HTMLElement>("[data-blob]");
    if (!notch || !blob) return;

    const skewTo = gsap.quickTo(blob, "skewX", { duration: 0.25, ease: "power3.out" });
    const stretchTo = gsap.quickTo(blob, "scaleX", { duration: 0.25, ease: "power3.out" });
    const squashTo = gsap.quickTo(blob, "scaleY", { duration: 0.25, ease: "power3.out" });

    const dx = fromLeft - notch.getBoundingClientRect().left;
    let last = dx;

    gsap.fromTo(notch, { x: dx }, {
        x: 0,
        duration: 0.35,
        ease: EASE.slide,
        overwrite: true,
        onUpdate() {
            const x = Number(gsap.getProperty(notch, "x"));
            const v = (x - last) / gsap.ticker.deltaRatio();
            last = x;
            const speed = Math.abs(v);
            skewTo(clamp(-v * SKEW_PER_PX, SKEW_MAX));
            stretchTo(1 + Math.min(speed * STRETCH_PER_PX, STRETCH_MAX));
            squashTo(1 - Math.min(speed * SQUASH_PER_PX, SQUASH_MAX));
        },
        onComplete() {
            gsap.to(blob, { skewX: 0, scaleX: 1, scaleY: 1, duration: 0.7, ease: EASE.release, overwrite: true });
        },
    });
}

export function press(tab: Element) {
    gsap.to(tab, { scale: 0.9, duration: 0.12, ease: "power2.out", overwrite: "auto" });
}

export function release(tab: Element) {
    gsap.to(tab, { scale: 1, duration: 0.6, ease: EASE.release, overwrite: "auto" });
}
