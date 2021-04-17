export enum Influence {
    Duke,
    Captain,
    Assassin,
    Contessa,
    Ambassador
}

export function influenceToString(influence) : string {
    return Influence[influence].toLowerCase();
}