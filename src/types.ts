export interface Deck {
    maindeck: Card[];
    sideboard: Card[];
}

export interface Card {
    name: string;
    count: number;
    highlighted: boolean;
}

export interface Result {
    pilot: string;
    url: string;
    deck: Deck;
    duplicatePilot: boolean;
    archetype: string;
}

export type Color = "W" | "U" | "B" | "R" | "G"