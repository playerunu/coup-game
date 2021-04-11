import {CounterActionType} from "./CounterAction";
import { Influence } from "./Influence";
import {Player} from "./Player";

export type PlayerCounterAction = {
	counterActionType: CounterActionType;
    player: Player;
    vsPlayer: Player;
    pretendingInfluence?: Influence;
}