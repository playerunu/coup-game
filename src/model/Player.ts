import {Card} from "./Card";

export type Player = {
    id: string;
    name: string;
    cards: Card[];
    coins: integer;
    gamePostion: integer;
}