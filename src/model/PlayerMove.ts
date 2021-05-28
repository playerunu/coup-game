import {Action} from "./Action";
import {Player} from "./Player";
import {Block} from "./Block";
import {Challenge} from "./Challenge";
import {ActionType} from "./Action";

export type PlayerMove = {
    action: Action;
    finished?: boolean;
    waitingReveal?: boolean;
    waitingExchange?: boolean;
    vsPlayer?: Player;
    challenge?: Challenge;
    block?: Block;
}

export function playerMoveToStr(playerMove : PlayerMove, playerName: string) : string {
    switch (playerMove.action.actionType) {
        case (ActionType.TakeOneCoin):
            return `${playerName} takes 1 coin`;
        case (ActionType.TakeTwoCoins):
            return `${playerName} wants to take 2 coins`;
        case (ActionType.TakeThreeCoins):
            return `${playerName} wants to take 3 coins`;
        case (ActionType.Assassinate):
            return `${playerName} wants to Assassinate ${playerMove.vsPlayer.name}`;
        case (ActionType.Steal):
            return `${playerName} wants to Steal from ${playerMove.vsPlayer.name}`;
        case (ActionType.Coup):
            return `${playerName} launched a coup against ${playerMove.vsPlayer.name}.`;
        case (ActionType.Exchange):
            return `${playerName} wants to exchange cards.`;
    }
}