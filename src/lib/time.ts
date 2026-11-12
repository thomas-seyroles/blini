// Dates et heures affichées à l'heure de Paris, quel que soit le fuseau du serveur
const TZ = "Europe/Paris";

const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
});

// Date ISO (AAAA-MM-JJ) et heure (HH:MM) d'un instant, à Paris
export function parisParts(d: Date) {
    const p = Object.fromEntries(parts.formatToParts(d).map((x) => [x.type, x.value]));
    return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

// Instant correspondant à une date et une heure lues à Paris
export function parisDate(date: string, time: string) {
    const utc = new Date(`${date}T${time}:00Z`);
    const shown = parisParts(utc);
    const drift = new Date(`${shown.date}T${shown.time}:00Z`).getTime() - utc.getTime();
    return new Date(utc.getTime() - drift);
}

export const todayIso = () => parisParts(new Date()).date;
