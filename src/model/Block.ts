import { Influence } from "./Influence";
import { Player } from "./Player";

export type Block = {
    player: Player;
    pretendingInfluence: Influence;
    challengedBy?: Player;
}