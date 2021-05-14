import {Action} from "./Action";
import {Player} from "./Player";
import {Block} from "./Block";
import {Challenge} from "./Challenge";

export type PlayerMove = {
    action: Action;
    waitingReveal?: boolean;
    waitingExchange?: boolean;
    vsPlayer?: Player;
    challenged?: Challenge;
    block?: Block;
}