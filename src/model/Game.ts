import {Player} from "./Player";
import {Card} from "./Card";
import {PlayerAction} from "./PlayerAction";

export type Game = {
    players: Player[];
    currentPlayer: Player;
    playerActions: PlayerAction[];
    tableCoins: integer;
}