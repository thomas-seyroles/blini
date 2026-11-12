type Point = { lat: number; lng: number };
type City = Point & { regionSlug: string };

const ROAD_FACTOR = 1.25;

// Distance routière estimée : vol d'oiseau majoré
export function roadKm(a: Point, b: Point) {
    const rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad;
    const dLng = (b.lng - a.lng) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)) * ROAD_FACTOR);
}

// Régions traversées : départ, ville la plus proche du milieu du trajet, arrivée
export function routeRegions(from: City, to: City, all: City[]) {
    const middle = { lat: (from.lat + to.lat) / 2, lng: (from.lng + to.lng) / 2 };
    const via = all.reduce((best, c) => (roadKm(c, middle) < roadKm(best, middle) ? c : best), from);
    return [...new Set([from.regionSlug, via.regionSlug, to.regionSlug])];
}
