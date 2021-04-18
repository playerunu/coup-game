import {Game} from "../model/Game";
import {Card} from "../model/Card";
import {Influence} from "../model/Influence";
import {Player} from "../model/Player";
import {influenceToString} from "../model/Influence";
import {deepMerge} from "../utils/deepMerge";
import { ActionType } from "../model/Action";
import { PlayerAction } from "../model/PlayerAction";

export class GameEngine {
    // Intial game state is empty,  it will be populated by incremental updates from the back-end
    game: Game = { 
        players: [],
        currentPlayer: {},
        playerActions: [],
        tableCoins: 0,
    }

    public heroPlayerName: string;
    
    // A pending player action is an action that awaits confirmation
    // from the hero player (i.e. )
    public pendingPlayerAction: PlayerAction = null;
    private onPendingActionConfirm: () => void;
    set OnPendingActionConfirm(callback: () => void) {
        this.onPendingActionConfirm = callback;
    }
    private onPendingActionCancel: () => void;
    set OnPendingActionCancel(callback: () => void) {
        this.onPendingActionCancel = callback;
    }

    updateGame(source: any) {
        let game = this.game;

        for (const key in source) {
            // We use keyToString helper function here in order to force
            // a strongly-typed check on each of the game keys 
            switch(key) {
                case "players":
                    for (let player of source.players) {
                        let gamePlayer = game.players.find(p => p.name == player.name);
                        if (gamePlayer) {
                            // If the player already exists, merge the update
                            deepMerge(gamePlayer, player);
                        } else {
                            // If the player does not exists, add the update obj to the array
                            game.players.push(player);
                        }
                    }
                    break;
                
                case "currentPlayer":
                    deepMerge(game.currentPlayer, source.currentPlayer);
                    break;
                
                case "playerActions":
                    break;
                
                case "tableCoins":
                    game.tableCoins = source.tableCoins;
                    break;
            }
        }
    }
    
    // Sets hero player full card details
    // If the player is not fund, it will create it
    setHeroPlayerCards(cards:any) {
        // Extract the cards and convert the influence from string to enum
        let {card1, card2} = cards;
        card1.influence = Influence[card1.influence];
        card2.influence = Influence[card2.influence];

        // Lookup if the player already exists in game state
        let heroPlayer = this.getHeroPlayer();

        // Player not found, create it 
        if (heroPlayer == null){
            heroPlayer = {
                name: this.heroPlayerName,
            }
        }

        heroPlayer.card1 = card1;
        heroPlayer.card2 = card2;

        this.updateGame({"players":[heroPlayer]});
    }

    isHeroPlayer(player: Player){
        return player.name == this.heroPlayerName;
    }

    getHeroPlayer(): Player {
        let heroPlayer: Player = null;

        for (const player of this.game.players) {
            if (this.isHeroPlayer(player)){
                heroPlayer = player;
                break;
            }
        }

        return heroPlayer;
    }

    getCardInfluencesStr(player: Player): {card1Img: string, card2Img: string} {
        let card1Img: string;
        let card2Img: string;
        
        if (engine.isHeroPlayer(player)){
            card1Img = influenceToString(player.card1.influence);
            card2Img = influenceToString(player.card2.influence);
        } else {
            card1Img = player.card1.isRevealed? influenceToString(player.card1.influence) : "back";
            card2Img = player.card2.isRevealed? influenceToString(player.card2.influence) : "back";
        }

        return {
            card1Img, 
            card2Img
        }
    }

    canTakeCoin() {
        if (!this.isHeroPlayer(this.game.currentPlayer)) {
            return false;
        }

        if (this.game.currentPlayerAction) {
            return false;
        }

        if (this.pendingPlayerAction && this.pendingPlayerAction.action.actionType === ActionType.TakeThreeCoins) {
            return false;
        }

        return true;
    }

    takeCoin() {
        if (!this.pendingPlayerAction) {
            this.pendingPlayerAction = {
                action: {
                    actionType:ActionType.TakeOneCoin,
                    hasCounterAction: false
                }
            }
            return;
        } else if (this.pendingPlayerAction.action.actionType == ActionType.TakeOneCoin) {
            this.pendingPlayerAction.action.actionType = ActionType.TakeTwoCoins;
            this.pendingPlayerAction.action.hasCounterAction = true;
        } else if (this.pendingPlayerAction.action.actionType == ActionType.TakeTwoCoins) {
            this.pendingPlayerAction.action.actionType = ActionType.TakeThreeCoins;
        }

        return;
    }

    waitingForAction() {
        if (!this.game.currentPlayerAction && !this.pendingPlayerAction) {
            return true;
        }

        return false;
    }

    waitingForActionConfirmation() {
        if ((this.game.currentPlayerAction && this.game.currentPlayerAction.action.hasCounterAction) || this.pendingPlayerAction) {
            return true;
        }

        return false;
    }

    confirmPendingAction() {
        this.game.currentPlayerAction = this.pendingPlayerAction;
        this.pendingPlayerAction = null;

        this.onPendingActionConfirm();
    }

    cancelPendingAction() {
        this.pendingPlayerAction = null;
        this.onPendingActionCancel();
    }

    getCurrentActionText() : string {
        const currentPlayerName = this.game.currentPlayer.name;
        const vsPlayerName = this.game.currentPlayerAction?.vsPlayer;

        if (this.game.currentPlayerAction) {
            switch (this.game.currentPlayerAction.action.actionType) {
                case (ActionType.TakeOneCoin):
                    return `${currentPlayerName} takes 1 coin`;
                case (ActionType.TakeTwoCoins):
                    return `${currentPlayerName} wants to take 2 coins`;
                case (ActionType.TakeThreeCoins):
                    return `${currentPlayerName} wants to take 3 coins`;
                case (ActionType.Assasinate):
                    return `${currentPlayerName} wants to Assassinate ${vsPlayerName}`;
                case (ActionType.Steal):
                    return `${currentPlayerName} wants to Steal from ${vsPlayerName}`;
            }
        } 

        return "";
    }
}

export const engine= new GameEngine();