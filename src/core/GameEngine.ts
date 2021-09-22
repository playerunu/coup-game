import { Game } from "../model/Game";
import { Card } from "../model/Card";
import { Influence } from "../model/Influence";
import { Action, canCounter } from "../model/Action";
import { Block } from "../model/Block";
import { Player } from "../model/Player";
import { influenceToStr } from "../model/Influence";
import { deepMerge } from "../utils/deepMerge";
import { ActionType } from "../model/Action";
import { PlayerMove, playerMoveToStr } from "../model/PlayerMove";
import { GameMessage } from "./GameMessage";
import { challengeToStr } from "../model/Challenge";

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

        if (this.isHeroPlayer(player)) {
            card1Img = influenceToStr(player.card1.influence);
            card2Img = influenceToStr(player.card2.influence);
        } else {
            card1Img = player.card1.isRevealed ? influenceToStr(player.card1.influence) : "back";
            card2Img = player.card2.isRevealed ? influenceToStr(player.card2.influence) : "back";
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
        return this.game.currentMove?.finished;
    }

    canCounter() : boolean {
        return this.canChallengeMove() || this.canBlockMove();
    }

    canChallengeMove() : boolean {
        if (this.isMoveFinished()) {
            return false;
        }

        if (this.waitingPlayerMove() && this.isHeroPlayerTurn()) {
            return false;
        }
        
        // Check if the current action can be challenged
        const currentMove = this.game.currentMove;
        if (currentMove) {
            if (currentMove.action.canChallenge && 
                // Check if nobody challenged it yet
                !currentMove.challenge && 
                // Cannot challenge anymore if someone blocked already
                !currentMove.block) 
            {
                return true;
            }
    
            // Check if the block can be challenged
            if (currentMove.block && 
                !currentMove.block.challenge &&
                // Don't challenge yourself 
                !this.isHeroPlayer(currentMove.block.player.name)) 
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
        
        if (this.game.currentMove) {
            if (this.game.currentMove.action.canBlock && !this.game.currentMove.block){
                return true;
            }
        }

        return false;
    }

    // 
    // Takes one coin and updates the pendingHeroPlayerMove
    // 
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
            vsPlayer: this.getPlayerByName(vsPlayerName)
        }
    }

    assassinate(vsPlayerName: string) {
        this.pendingHeroPlayerMove = {
            action: {
                actionType: ActionType.Assassinate,
            },
            vsPlayer: this.getPlayerByName(vsPlayerName)
        }
    }

    coup(vsPlayerName: string) {
        this.pendingHeroPlayerMove = {
            action: {
                actionType: ActionType.Coup,
            },
            vsPlayer: this.getPlayerByName(vsPlayerName)
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
        let counter = deepMerge({}, this.game.currentMove);
        counter.block = { 
            player : this.getHeroPlayer(),
            pretendingInfluence,
        }

        this.pendingCounter = {
            pretendingInfluence : pretendingInfluence,
            messageType : GameMessage[GameMessage.BlockAction],
            data: counter
        }
    }

    challenge() {
        let counter = deepMerge({}, this.game.currentMove);
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

    confirmPendingCounter() {
        this.game.currentMove = this.pendingCounter.data;
        this.pendingCounter = null;
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
                case (GameMessage[GameMessage.BlockAction]):
                    return `Block with ${influenceToStr(this.pendingCounter.pretendingInfluence)}`;
                case (GameMessage[GameMessage.ChallengeAction]):
                case (GameMessage[GameMessage.ChallengeBlock]):
                    return "Challenge";
            }
        }

        if (this.game.currentMove) {
            // Blocked
            if (this.game.currentMove.block) {
                const block = this.game.currentMove.block;
                if ("challenge" in block) {
                    // Someone challenged the block
                    const challengedActionStr = `${block.player.name} blocks with ${influenceToStr(block.pretendingInfluence)}`;
                    return challengeToStr(block.challenge, block.player.name, challengedActionStr);
                } else {
                    return `${block.player.name} blocks with ${influenceToStr(block.pretendingInfluence)}`;
                }
            }

            // Challenged
            if (this.game.currentMove.challenge) {
               return `${challengeToStr(this.game.currentMove.challenge, currentPlayerName, playerMoveToStr(this.game.currentMove, currentPlayerName))}`
            }

            return playerMoveToStr(this.game.currentMove, currentPlayerName);
        }


        return this.game.currentPlayer.name + "'s turn";
    }
}

export const engine = new GameEngine();