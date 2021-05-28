import { Game } from "../model/Game";
import { Card } from "../model/Card";
import { Influence } from "../model/Influence";
import { Action, canCounter } from "../model/Action";
import { Block } from "../model/Block";
import { Player } from "../model/Player";
import { influenceToString } from "../model/Influence";
import { deepMerge } from "../utils/deepMerge";
import { ActionType } from "../model/Action";
import { PlayerMove } from "../model/PlayerMove";
import { GameMessage } from "./GameMessage";

export class GameEngine {
    // Intial game state is empty,  it will be populated by incremental updates from the back-end
    game: Game = {
        players: [],
        remainingPlayers: 0,
        currentPlayer: {},
        currentMove: undefined,
        tableCoins: 0,
    }

    public heroPlayerName: string;

    // A pending player action is an action that awaits confirmation
    public pendingHeroPlayerMove: PlayerMove = null;
    private onPendingConfirmCallbacks: (() => void)[] = [];
    set OnPendingActionConfirm(callback: () => void) {
        this.onPendingConfirmCallbacks.push(callback);
    }
    private onPendingCancelCallbacks: (() => void)[] = [];
    set OnPendingActionCancel(callback: () => void) {
        this.onPendingCancelCallbacks.push(callback);
    }

    public pendingCounter = null;

    updateGame(source: any) {
        let game = this.game;

        if (!("currentMove" in source)) {
            game.currentMove = null
        }

        for (const key in source) {
            switch (key) {
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

                case "remainingPlayers":
                    game.remainingPlayers = source.remainingPlayers;
                    break;

                case "winner":
                    game.winner = deepMerge({}, source.winner) as Player;
                    break;

                case "currentPlayer":
                    game.currentPlayer = deepMerge({}, source.currentPlayer) as Player;
                    break;

                case "currentMove":
                    game.currentMove = deepMerge({}, source.currentMove) as PlayerMove;
                    break;
                
                case "tableCoins":
                    game.tableCoins = source.tableCoins;
                    break;
            }
        }
    }

    // Sets hero player full card details
    // If the player is not fund, it will create it
    setHeroPlayerCards(cards: any) {
        // Extract the cards and convert the influence from string to enum
        let { card1, card2 } = cards;
        card1.influence = Influence[card1.influence];
        card2.influence = Influence[card2.influence];

        // Lookup if the player already exists in game state
        let heroPlayer = this.getHeroPlayer();

        // Player not found, create it 
        if (heroPlayer == null) {
            heroPlayer = {
                name: this.heroPlayerName,
            }
        }

        heroPlayer.card1 = card1;
        heroPlayer.card2 = card2;

        this.updateGame({ "players": [heroPlayer] });
    }

    isHeroPlayer(player: Player | string) {
        const playerName = (player as Player)?.name || player;
        return playerName == this.heroPlayerName;
    }

    isHeroPlayerTurn() {
        return this.game.currentPlayer.name === this.heroPlayerName;
    }

    getHeroPlayer(): Player {
        return this.game.players.find(player => this.isHeroPlayer(player));
    }

    getPlayerByName(name): Player {
        return this.game.players.find(player => player.name === name);
    }

    getCardInfluencesStr(player: Player): { card1Img: string, card2Img: string } {
        let card1Img: string;
        let card2Img: string;

        if (engine.isHeroPlayer(player)) {
            card1Img = influenceToString(player.card1.influence);
            card2Img = influenceToString(player.card2.influence);
        } else {
            card1Img = player.card1.isRevealed ? influenceToString(player.card1.influence) : "back";
            card2Img = player.card2.isRevealed ? influenceToString(player.card2.influence) : "back";
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

        if (this.game.currentMove) {
            return false;
        }

        if (this.pendingHeroPlayerMove && this.pendingHeroPlayerMove.action.actionType === ActionType.TakeThreeCoins) {
            return false;
        }

        return true;
    }

    isMoveFinished() : boolean {
        return engine.game.currentMove?.finished;
    }

    canCounter() : boolean {
        return this.canChallengeMove() || this.canBlockMove();
    }

    canChallengeMove() : boolean {
        if (this.isMoveFinished()) {
            return false;
        }

        if (this.isHeroPlayerTurn()) {
            return false;
        }
        
        // Check if the current action can be challenged
        if (engine.game.currentMove) {
            if (engine.game.currentMove.action.canChallenge && 
                // Check if nobody challenged it yet
                !engine.game.currentMove.challenge && 
                // Blocked actions cannot be challenged anymore
                !engine.game.currentMove.block) 
            {
                return true;
            }
    
            // Check if the block action can be challenged
            if (engine.game.currentMove.block && 
                !engine.game.currentMove.block.challenge &&
                // Can challenge only if the block was made by someone else
                !engine.isHeroPlayer(engine.game.currentMove.block.player.name)) 
            {
                return true;
            }
        }
        
        return false;
    }

    canBlockMove() : boolean {
        if (this.isMoveFinished()) {
            return false;
        }

        if (this.isHeroPlayerTurn()) {
            return false;
        }
        
        if (engine.game.currentMove) {
            if (engine.game.currentMove.action.canBlock && !engine.game.currentMove.block){
                return true;
            }
        }

        return false;
    }

    takeCoin() {
        if (!this.pendingHeroPlayerMove) {
            this.pendingHeroPlayerMove = {
                action: {
                    actionType: ActionType.TakeOneCoin,
                }
            }
            return;
        } else if (this.pendingHeroPlayerMove.action.actionType == ActionType.TakeOneCoin) {
            this.pendingHeroPlayerMove.action.actionType = ActionType.TakeTwoCoins;
        } else if (this.pendingHeroPlayerMove.action.actionType == ActionType.TakeTwoCoins) {
            this.pendingHeroPlayerMove.action.actionType = ActionType.TakeThreeCoins;
        }

        return;
    }

    steal(vsPlayerName: string) {
        this.pendingHeroPlayerMove = {
            action: {
                actionType: ActionType.Steal,
            },
            vsPlayer: engine.getPlayerByName(vsPlayerName)
        }
    }

    assassinate(vsPlayerName: string) {
        this.pendingHeroPlayerMove = {
            action: {
                actionType: ActionType.Assassinate,
            },
            vsPlayer: engine.getPlayerByName(vsPlayerName)
        }
    }

    coup(vsPlayerName: string) {
        this.pendingHeroPlayerMove = {
            action: {
                actionType: ActionType.Coup,
            },
            vsPlayer: engine.getPlayerByName(vsPlayerName)
        }
    }

    exchange() {
        this.pendingHeroPlayerMove = {
            action: {
                actionType: ActionType.Exchange,
            }
        }
    }

    block(pretendingInfluence: Influence) {
        let counter = this.game.currentMove;
        counter.block = { 
            player : this.getHeroPlayer(),
            pretendingInfluence,
        }

        this.pendingCounter = {
            pretendingInfluence : pretendingInfluence,
            messageType : GameMessage[GameMessage.Block],
            data: counter
        }
    }

    challenge() {
        let counter = this.game.currentMove;
        let messageType : GameMessage;

        if (this.game.currentMove.block) {
            messageType = GameMessage.ChallengeBlock;
            counter.block.challenge = {
                challengedBy: this.getHeroPlayer(),
            }
        } else {
            messageType = GameMessage.ChallengeAction;
            counter.challenge = {
                challengedBy: this.getHeroPlayer(),
            }
        }

        this.pendingCounter = {
            messageType: GameMessage[messageType],
            data: counter
        }
    }

    waitingPlayerMove() {
        if (!this.game.currentMove && !this.pendingHeroPlayerMove) {
            return true;
        }

        return false;
    }

    waitingForTakeCoinsConfirmation() {
        const pendingPlayerAction = this.pendingHeroPlayerMove;

        if (!pendingPlayerAction) {
            return false;
        }

        if (pendingPlayerAction.action.actionType === ActionType.TakeOneCoin ||
            pendingPlayerAction.action.actionType === ActionType.TakeTwoCoins
            || pendingPlayerAction.action.actionType === ActionType.TakeThreeCoins) {
            return true;
        }

        return false;
    }

    confirmPendingAction() {
        this.game.currentMove = this.pendingHeroPlayerMove;
        this.pendingHeroPlayerMove = null;

        for (const callback of this.onPendingConfirmCallbacks) {
            callback();
        }
    }

    cancelPendingAction() {
        this.pendingHeroPlayerMove = null;

        for (const callback of this.onPendingCancelCallbacks) {
            callback();
        }
    }

    getCurrentActionText(): string {
        const currentPlayerName = this.game.currentPlayer.name;
        const vsPlayerName = this.game.currentMove?.vsPlayer?.name;

        if (this.pendingHeroPlayerMove) {
            switch (this.pendingHeroPlayerMove.action.actionType) {
                case (ActionType.TakeOneCoin):
                    return "Confirm taking 1 coin";
                case (ActionType.TakeTwoCoins):
                    return "Confirm taking 2 coins";
                case (ActionType.TakeThreeCoins):
                    return "Confirm taking 3 coins";
                case (ActionType.Steal):
                    return `Steal from ${this.pendingHeroPlayerMove.vsPlayer.name}`;
                case (ActionType.Assassinate):
                    return `Assassinate ${this.pendingHeroPlayerMove.vsPlayer.name}`;
                case (ActionType.Coup):
                    return `Launch a Coup against ${this.pendingHeroPlayerMove.vsPlayer.name}`;
                case (ActionType.Exchange):
                    return "Exchange cards";
            }
        }

        if (this.pendingCounter) {
            switch (this.pendingCounter.messageType) {
                case (GameMessage[GameMessage.Block]):
                    return `Block with ${influenceToString(this.pendingCounter.pretendingInfluence)}`;
                case (GameMessage[GameMessage.ChallengeAction]):
                case (GameMessage[GameMessage.ChallengeBlock]):
                    return "Challenge";
            }
        }

        if (this.game.currentMove) {
            switch (this.game.currentMove.action.actionType) {
                case (ActionType.TakeOneCoin):
                    return `${currentPlayerName} takes 1 coin`;
                case (ActionType.TakeTwoCoins):
                    return `${currentPlayerName} wants to take 2 coins`;
                case (ActionType.TakeThreeCoins):
                    return `${currentPlayerName} wants to take 3 coins`;
                case (ActionType.Assassinate):
                    return `${currentPlayerName} wants to Assassinate ${vsPlayerName}`;
                case (ActionType.Steal):
                    return `${currentPlayerName} wants to Steal from ${vsPlayerName}`;
                case (ActionType.Coup):
                    return `${currentPlayerName} launched a coup against ${vsPlayerName}.`;
                case (ActionType.Exchange):
                    return `${currentPlayerName} wants to exchange cards.`;
            }
        }

        return this.game.currentPlayer.name + "'s turn";
    }
}

export const engine = new GameEngine();