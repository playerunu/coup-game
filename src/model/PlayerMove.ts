import {Action} from "./Action";
import {Player} from "./Player";
import {Block} from "./Block";
import {Challenge} from "./Challenge";

export type PlayerMove = {
    action: Action;
    finished?: boolean;
    waitingReveal?: boolean;
    waitingExchange?: boolean;
    vsPlayer?: Player;
    challenge?: Challenge;
    block?: Block;
}