import {Action} from "./Action";
import {Player} from "./Player";
import {Block} from "./Block";

export type PlayerAction = {
    action?: Action;
    vsPlayer?: Player;
    challengedBy?: Player;
    blockAction?: Block;
}