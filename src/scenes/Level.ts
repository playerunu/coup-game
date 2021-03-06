import { Constants } from "../Constants";
import { GameMessage } from "../core/GameMessage";
import { engine } from "../core/GameEngine";
import { WsScene } from "./WsScene";
import { Coin } from "../game-objects/Coin";
import { TablePlayer } from "../game-objects/TablePlayer";
import { TakeCoinsPanel } from "../game-objects/hero-player-panels/TakeCoinsPanel";
import { ActionType } from "../model/Action";
import { HeroPlayerPanel } from "../game-objects/hero-player-panels/HeroPlayerPanel";
import { CounterActionPanel } from "../game-objects/counter-action-panels/CounterActionPanel";
import { Card } from "../model/Card";
import { ExchangeResult } from "../model/ExchangeResult";

export class Level extends WsScene {
    private bankCoins: Coin[] = [];
    private coinsPanel: TakeCoinsPanel;
    private currentPlayerTween: Phaser.Tweens.Tween;
    private currentActionDescription: Phaser.GameObjects.Text;
    private curentActionZone: Phaser.GameObjects.Zone;
    private heroPlayerPanel: HeroPlayerPanel;
    private counterActionPanel: CounterActionPanel;
    private table: Phaser.GameObjects.Image;
    private tablePlayers: TablePlayer[] = [];

    // Game updates tweens that need to run sequentially
    private isTweenRunning: false;
    private pendingTweens: (() => void)[];

    private messages = [];

    get HeroPlayer() {
        return this.tablePlayers[0];
    }

    private tablePlayersXY = [
        { x: -75, y: +150 },
        { x: -550, y: -60 },
        { x: -75, y: -400 },
        { x: +360, y: -60 },
    ];

    create() {
        super.create();

        const width = Constants.gameWidth;
        const height = Constants.gameHeight;
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        // Background
        const background = this.add.image(0, 0, "background");

        // Center the background in the game
        Phaser.Display.Align.In.Center(background, this.add.zone(0, 0, width, height).setOrigin(0, 0));

        // Table
        this.table = this.add.image(halfWidth, halfHeight, "table").setOrigin(0, 0);
        Phaser.Display.Align.In.Center(this.table, background);

        // Randomly spread the coins on the table
        for (let i = 0; i < engine.game.tableCoins; i++) {
            let x = Phaser.Math.Between(halfWidth - 80, halfWidth + 80);
            let y = Phaser.Math.Between(halfHeight - 50, halfHeight + 50);

            const coin = new Coin(this, x, y);
            this.add.existing(coin);
            this.bankCoins.push(coin);
        }

        // Current action description
        this.curentActionZone = this.add.zone(0, 250, width, height).setOrigin(0, 0);
        this.currentActionDescription = this.add.text(0, 0, `${engine.game.currentPlayer.name} turn`, Constants.defaultTextCss);
        Phaser.Display.Align.In.TopCenter(this.currentActionDescription, this.curentActionZone);

        // Coins panel
        this.coinsPanel = new TakeCoinsPanel(this, halfWidth - 30, halfHeight - 120).setVisible(false);
        this.add.existing(this.coinsPanel);

        // Hero player panel
        this.addHeroPlayerPanel();

        // Counter action panel
        this.addCounterActionPanel();

        // Table players
        this.addTablePlayers();

        // Set up sending current action to server on confirmation
        engine.OnPendingActionConfirm = () => {
            this.hidePanel(this.heroPlayerPanel);
            this.sendWsMessage({
                messageType: GameMessage[GameMessage.Action],
                data: engine.game.currentMove
            });
        };

        // Set up sending exchange result to server on confirmation
        engine.OnPendingExchangeConfirm = (exchangeResult: ExchangeResult) => {
            this.sendWsMessage({
                messageType: GameMessage[GameMessage.ExchangeComplete],
                data: exchangeResult,
            });
        };

        this.startCurrentPlayerTween();

        this.nextPlayer();
    }

    // Refresh the game objects based on the current game state
    update(time: any, delta: any) {
        // Update the current action description text
        this.currentActionDescription.setText(engine.getCurrentActionText());
        Phaser.Display.Align.In.TopCenter(this.currentActionDescription, this.curentActionZone);

        // Update table players text
        for (let player of this.tablePlayers) {
            player.update();
        }

        if (engine.isHeroPlayerTurn()) {
            // Show/hide take coins panel buttons
            this.coinsPanel.setVisible(engine.waitingForTakeCoinsConfirmation());

            // Update the hero player panel
            this.heroPlayerPanel.update();
        } else {
            // Show/hide take coins panel buttons
            this.coinsPanel.setVisible(false);
        }
    }

    protected onWsMessage(event) {
        const message = JSON.parse(event.data);
        console.log(message);
        this.messages.push(message);
        engine.updateGameState(message.Data);

        switch (message.MessageType) {
            case GameMessage[GameMessage.Action]:
                let actionType = engine.game.currentMove.action.actionType;
                if (!engine.isHeroPlayerTurn()) {
                    let currentTablePlayer = this.getCurrentTablePlayer();
                    switch (actionType) {
                        //
                        // Show coin animations for take 1/2/3 coins, assassinate and coup action
                        //
                        case ActionType.TakeOneCoin:
                            currentTablePlayer.getCoinFromBank(this.bankCoins.pop());
                            break;
                        case ActionType.TakeTwoCoins:
                            [1, 2].forEach(() => currentTablePlayer.getCoinFromBank(this.bankCoins.pop()));
                            break;
                        case ActionType.TakeThreeCoins:
                            [1, 2, 3].forEach(() => currentTablePlayer.getCoinFromBank(this.bankCoins.pop()));
                            break;
                        case ActionType.Assassinate:
                            currentTablePlayer.moveCoinsToBank(3, true);
                            break;
                        case ActionType.Coup:
                            currentTablePlayer.moveCoinsToBank(7, false);
                            break;
                    }
                }

                if (engine.canCounter()) {
                    this.showPanel(this.counterActionPanel);
                    this.counterActionPanel.update();
                }

                console.log(engine.game);
                break;
            case GameMessage[GameMessage.ActionResult]:
                actionType = engine.game.currentMove.action.actionType;
                if (actionType === ActionType.Steal) {
                    let currentTablePlayer = this.getCurrentTablePlayer();
                    let vsPlayer = this.getCurrentVsTablePlayer();
                    
                    for (const coin of vsPlayer.getCoinToBeStolen()) {
                        currentTablePlayer.stealCoin(coin);    
                    }
                }

                this.hidePanel(this.counterActionPanel);
                break;
            case GameMessage[GameMessage.CurrentActionChallenge]:
            case GameMessage[GameMessage.ChallengeBlock]:
            case GameMessage[GameMessage.WaitingExchange]:
                // Hide the challenge panel until the challenge is solved by the server
                this.counterActionPanel.update();
                this.hidePanel(this.counterActionPanel);
                break;
            case GameMessage[GameMessage.ChallengeActionResult]:
            case GameMessage[GameMessage.ChallengeBlockResult]:
            case GameMessage[GameMessage.WaitingReveal]:
                break;
            case GameMessage[GameMessage.BlockAction]:
                this.showPanel(this.counterActionPanel);
                this.counterActionPanel.update();
                break;
            case GameMessage[GameMessage.YourExchangeCards]:
                this.getHeroTablePlayer().renderExchange(message.Data.card1, message.Data.card2);
                break;
            case GameMessage[GameMessage.ExchangeComplete]:
                break;
            case GameMessage[GameMessage.NextPlayer]:
                this.nextPlayer();
                break;
            case GameMessage[GameMessage.GameOver]:
                // Don't allow any further actions - not the most elegant solution yet
                this.hidePanel(this.heroPlayerPanel);
                this.hidePanel(this.counterActionPanel);

                break;
        }
    }

    private addTablePlayers() {
        let totalPlayers = engine.game.players.length;

        for (let tableIndex = 0, gameIndex = engine.getHeroPlayer().gamePosition;
            tableIndex < engine.game.players.length;
            tableIndex++, gameIndex = (gameIndex + 1) % totalPlayers) {

            const player = engine.game.players.find((p => p.gamePosition === gameIndex));

            let x = Constants.gameWidth / 2 + this.tablePlayersXY[tableIndex].x;
            let y = Constants.gameHeight / 2 + this.tablePlayersXY[tableIndex].y;
            let tablePlayer = new TablePlayer(player, this, x, y);
            this.tablePlayers.push(tablePlayer);
            this.add.existing(tablePlayer);

            // Draw the coins
            for (let index = 0; index < player.coins; index++) {
                tablePlayer.getCoinFromBank(this.bankCoins.pop());
            }

            if (engine.isHeroPlayer(player)) {
                tablePlayer.onPointerOver = (card: Card, cardImg: Phaser.GameObjects.Image) => {
                    if (engine.waitingReveal() && engine.isHeroPlayer(engine.getWaitingRevealPlayer())){
                        cardImg.setTint(Constants.redTint);
                        engine.revealCard(card);
                    }
                }
                tablePlayer.onPointerOut = (card: Card, cardImg: Phaser.GameObjects.Image) => {
                    if (engine.waitingReveal() && engine.isHeroPlayer(engine.getWaitingRevealPlayer())){
                        cardImg.clearTint();
                        engine.pendingReveal = null;
                    }
                }
                tablePlayer.onPointerUp = (card: Card, cardImg: Phaser.GameObjects.Image) => {
                    if (engine.waitingReveal() && engine.isHeroPlayer(engine.getWaitingRevealPlayer())){
                        this.sendWsMessage(engine.pendingReveal);
                        cardImg.clearTint();
                        engine.pendingReveal = null;
                    }
                }
            }
        }
    }

    private addHeroPlayerPanel() {
        this.heroPlayerPanel = new HeroPlayerPanel(this, Constants.gameWidth + 300, 0);
        this.heroPlayerPanel.onPointerOver = (actionType, vsPlayer) => {
            if (vsPlayer) {
                const tablePlayer = this.tablePlayers.find((tablePlayer) => tablePlayer.PlayerName == vsPlayer.name)
                tablePlayer.setTint(Constants.redTint);
            }

            switch (actionType) {
                case ActionType.Steal:
                    engine.steal(vsPlayer.name);
                    break;
                case ActionType.Assassinate:
                    engine.assassinate(vsPlayer.name);
                    break;
                case ActionType.Coup:
                    engine.coup(vsPlayer.name);
                    break;
                case ActionType.Exchange:
                    engine.exchange();
                    break;
            }
        }
        this.heroPlayerPanel.onPointerOut = (vsPlayer) => {
            if (vsPlayer) {
                const tablePlayer = this.tablePlayers.find((tablePlayer) => tablePlayer.PlayerName == vsPlayer.name)
                tablePlayer.clearTint();
            }

            engine.cancelPendingAction();
        }

        this.heroPlayerPanel.onPointerUp = () => {
            // Show coup animations for hero player's assassinate/coup actions
            if (engine.isPendingAssassinate()) {
                this.HeroPlayer.moveCoinsToBank(3, true);
            } else if (engine.isPendingCoup()) {
                this.HeroPlayer.moveCoinsToBank(7, false);
            }

            
            engine.confirmPendingAction();
            this.hidePanel(this.heroPlayerPanel);
        }

        this.add.existing(this.heroPlayerPanel);
    }

    private addCounterActionPanel() {
        this.counterActionPanel = new CounterActionPanel(this, Constants.gameWidth + 300, 0);

        this.counterActionPanel.onPointerOver = (actionType, influence) => {
            switch (actionType) {
                case ActionType.Block:
                    engine.block(influence);
                    break;
                case ActionType.Challenge:
                    engine.challenge();
                    break;
            }
        }

        this.counterActionPanel.onPointerOut = () => {
            engine.pendingCounter = null;
        }

        this.counterActionPanel.onPointerUp = () => {
            this.sendWsMessage(engine.pendingCounter);
            engine.confirmPendingCounter();
            this.hidePanel(this.counterActionPanel);
        }

        this.add.existing(this.counterActionPanel);
    }

    private nextPlayer() {
        // Update the hero player panel
        this.heroPlayerPanel.update();
        if (engine.isHeroPlayerTurn()) {
            this.showPanel(this.heroPlayerPanel);
        }
    }

    private getTablePlayerByName(playerName: string): TablePlayer {
        return this.tablePlayers.find((tablePlayer) => tablePlayer.PlayerName === playerName);
    }

    private getCurrentTablePlayer(): TablePlayer {
        return this.getTablePlayerByName(engine.game.currentPlayer.name);
    }

    private getCurrentVsTablePlayer(): TablePlayer {
        return this.getTablePlayerByName(engine.game.currentMove.vsPlayer.name);
    }

    private getHeroTablePlayer(): TablePlayer {
        return this.getTablePlayerByName(engine.getHeroPlayer().name);
    }

    private enqueueTween(callback: () => void) {
        this.pendingTweens.push(callback);
    }

    private startCurrentPlayerTween() {
        if (this.currentPlayerTween) {
            return;
        }

        let lastUpdated: TablePlayer = this.getCurrentTablePlayer();

        this.currentPlayerTween = this.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 1000,
            ease: Phaser.Math.Easing.Sine.InOut,
            repeat: -1,
            yoyo: true,
            onUpdate: (tween) => {
                if (engine.waitingPlayerMove()) {
                    const value = tween.getValue();
                    const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
                        Phaser.Display.Color.ValueToColor(Constants.darkGreenTint),
                        Phaser.Display.Color.ValueToColor(Constants.greenTint),
                        100,
                        value
                    );
                    const color = Phaser.Display.Color.GetColor(colorObject.r, colorObject.g, colorObject.b);

                    if (this.getCurrentTablePlayer() != lastUpdated) {
                        lastUpdated.clearTint();
                        lastUpdated = this.getCurrentTablePlayer();
                    }
                    this.getCurrentTablePlayer().setTint(color);
                } else {
                    if (engine.pendingHeroPlayerMove) {
                        this.getCurrentTablePlayer().setTint(Constants.yellowTint);
                    } else {
                        this.getCurrentTablePlayer().clearTint();
                    }
                }
            },
        });
    }

    private showPanel(panel: Phaser.GameObjects.GameObject) {
        this.tweens.add({
            targets: panel,
            //ease: "Back",
            //delay: 500,
            x: Constants.gameWidth - 270,
            duration: 100,
        });
    }

    private hidePanel(panel: Phaser.GameObjects.GameObject) {
        this.tweens.add({
            targets: panel,
            //ease: "Back",
            x: Constants.gameWidth + 300,
            duration: 100
        })
    }
}

