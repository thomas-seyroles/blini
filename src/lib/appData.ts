import type { Anecdote } from "./anecdotes";
import type { Playlist } from "./playlists";
import type { Role, Settings } from "./enums";
import type { BookedTrip } from "./trips";

export type PackageOrder = { recipient: string; street: string; postalCode: string; city: string; conteuse: boolean; totalCents: number };

export type PointEvent = { id: string; label: string; points: number; date: string };

// Données du compte connecté, chargées par le serveur à chaque rendu de l'application
export type AppData = {
    profile: { firstName: string; lastName: string; email: string; photo: string | null; role: Role; rulesAccepted: boolean };
    linked: { blablacar: boolean; lunii: boolean };
    settings: Settings;
    points: number;
    history: PointEvent[];
    ownedStories: string[];
    gifts: string[];
    inventory: string[];
    badges: string[];
    anecdotes: Anecdote[];
    trips: BookedTrip[];
    playlists: Playlist[];
    blablacarTrips: number;
    packageOrder: PackageOrder | null;
};
