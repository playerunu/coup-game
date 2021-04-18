export enum ActionType {
    TakeOneCoin, 
	TakeTwoCoins,
	TakeThreeCoins,
	Exchange,
	Assassinate,
	Steal
}

export type Action = {
    actionType: ActionType;
    hasCounterAction: boolean;
} 