import {Player} from "./Player";
import {Card} from "./Card";
import {PlayerMove} from "./PlayerMove";

export type Game = {
    players: Player[];
    remainingPlayers: integer;
    winner?: Player;
    currentPlayer: Player;
    currentMove?: PlayerMove;
    tableCoins: integer;
}