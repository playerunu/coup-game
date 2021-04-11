export enum ActionType {
    TakeOneCoin, 
	TakeTwoCoins,
	TakeThreeCoins,
	Exchange,
	Assasinate,
	Steal
}

export type Action = {
    actionType: ActionType;
    hasCounterAction: boolean;
} 