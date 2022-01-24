import {Influence} from "./Influence";

export type Card = {
    influence?: Influence
    isRevealed: boolean
}

export type TwoCards = {
    card1: Card;
    card2: Card;
}