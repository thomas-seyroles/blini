export const STATUSES = ["Envoyée", "En écoute", "Retenue", "En écriture", "Publiée"] as const;

export type Anecdote = {
    id: string;
    title: string;
    place: string;
    audioSec: number;
    hasPhoto: boolean;
    photoUrl?: string;
    details: string;
    status: 0 | 1 | 2 | 3 | 4;
    points: number;
    sentAt: string;
    validated: boolean;
    tripLabel: string;
};

export const seedAnecdotes: Anecdote[] = [
    { id: "an-1", title: "La boulangerie de Saulieu", place: "Saulieu · Bourgogne-Franche-Comté", audioSec: 84, hasPhoto: false, details: "", status: 1, points: 20, sentAt: "2 nov.", validated: true, tripLabel: "Paris → Lyon" },
    { id: "an-2", title: "Le pont qui chantait sous la pluie", place: "Côte-d’Or · Bourgogne-Franche-Comté", audioSec: 125, hasPhoto: true, details: "Un pont de pierre qui sonne comme une flûte quand il pleut.", status: 2, points: 120, sentAt: "28 oct.", validated: true, tripLabel: "Dijon → Paris" },
    { id: "an-3", title: "Le clocher de Semur-en-Auxois", place: "Semur-en-Auxois · Bourgogne-Franche-Comté", audioSec: 96, hasPhoto: false, details: "", status: 0, points: 20, sentAt: "Aujourd’hui", validated: false, tripLabel: "Paris → Lyon" },
];

export const minSec = (sec: number) => `${Math.floor(sec / 60)} min ${String(sec % 60).padStart(2, "0")}`;
export const clock = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(Math.floor(sec) % 60).padStart(2, "0")}`;
export const regionOf = (place: string) => place.split(" · ").pop() ?? place;

export type StepState = "done" | "current" | "todo";
export type DetailStep = { title: string; sub: string; state: StepState };

// Suivi détaillé : la première étape non atteinte est « en cours »
export function detailSteps(a: Anecdote): DetailStep[] {
    const steps: [string, string, string, boolean][] = [
        ["Enregistrée", `${a.sentAt} · ${a.tripLabel}`, "À l’instant", true],
        ["Validée par les passagers", "Fin du trajet", "À la fin du trajet", a.validated],
        ["En écoute", "Par l’équipe Lunii", "Par l’équipe Lunii", a.status >= 1],
        ["Retenue", "+300 pts gagnés", "Si l’équipe Lunii retient ton récit", a.status >= 2],
        ["En écriture", "Les auteurs Lunii en font une histoire", "Les auteurs Lunii en font une histoire", a.status >= 3],
        ["Publiée", "Disponible dans la bibliothèque", "Elle te sera offerte", a.status >= 4],
    ];
    let current = false;
    return steps.map(([title, doneSub, todoSub, reached]) => {
        if (reached) return { title, sub: doneSub, state: "done" };
        if (!current) {
            current = true;
            return { title, sub: todoSub, state: "current" };
        }
        return { title, sub: todoSub, state: "todo" };
    });
}

// Réduit la photo pour tenir dans le localStorage
export function shrinkPhoto(file: File, max = 480): Promise<string | undefined> {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const k = Math.min(1, max / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * k);
            canvas.height = Math.round(img.height * k);
            canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(undefined);
        };
        img.src = url;
    });
}
