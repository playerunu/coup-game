import {Card} from "./Card";

export type Player = {
    id?: string;
    name?: string;
    card1?: Card;
    card2?: Card;
    coins?: integer;
    gamePosition?: integer;
}