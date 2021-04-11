export enum CounterActionType {
    Block,
    Challenge
}

export type CounterAction = {
    counterActionType: CounterActionType;
    hasCounterAction: boolean;
}