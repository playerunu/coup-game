import {Card} from "./Card";

export type Player = {
    name?: string;
    card1?: Card;
    card2?: Card;
    coins?: integer;
    gamePosition?: integer;
}

export function isEliminated(player: Player) {
    return player.card1 && player.card1.isRevealed && player.card2 && player.card2.isRevealed;
}

export function remainingCards(player: Player): number {
    let remainingCards = 0;
    if (!player.card1.isRevealed) {
        remainingCards++;
    }
    if (!player.card2.isRevealed) {
        remainingCards++;
    }

    return remainingCards;
}