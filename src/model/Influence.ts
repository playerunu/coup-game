export enum Influence {
    Duke,
    Captain,
    Assassin,
    Contessa,
    Ambassador
}

export function influenceToStr(influence) : string {
    return Influence[influence].toLowerCase();
}