import { Influence } from "./Influence";

export enum ActionType {
    TakeOneCoin, 
	TakeTwoCoins,
	TakeThreeCoins,
	Exchange,
	Assassinate,
	Steal,
	Coup,
    Block,
    Challenge
}

export type Action = {
    actionType: ActionType;
    canChallenge?: boolean;
	canBlock?: boolean;
	influence?: Influence;
} 

export function canCounter(action: Action) : boolean {
	return action.canChallenge || action.canBlock;
}