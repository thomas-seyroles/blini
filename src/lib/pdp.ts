const pdps = [
    "/images/pdp/random-person.jpeg",
    "/images/pdp/random-person-2.jpeg",
    "/images/pdp/random-person-3.jpeg",
];

export const pdpAt = (i: number) => pdps[i % pdps.length];
