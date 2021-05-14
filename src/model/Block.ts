import { Influence } from "./Influence";
import { Player } from "./Player";
import {Challenge } from "./Challenge";

export type Block = {
    player: Player;
    pretendingInfluence: Influence;
    challenge?: Challenge;
}