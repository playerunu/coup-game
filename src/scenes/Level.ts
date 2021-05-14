import { Constants } from "../Constants";
import { isEliminated } from "../model/Player";
import { GameMessage } from "../core/GameMessage";
import { engine } from "../core/GameEngine";
import { WsScene } from "./WsScene";
import { Coin } from "../game-objects/Coin";
import { TablePlayer } from "../game-objects/TablePlayer";
import { VsPlayerPanel } from "../game-objects/VsPlayerPanel";
import { TakeCoinsPanel } from "../game-objects/TakeCoinsPanel";
import { ActionType } from "../model/Action";

export class Level extends WsScene {
    private bankCoins: Coin[] = [];
    private coinsPanel: TakeCoinsPanel;
    private currentPlayerTween: Phaser.Tweens.Tween;
    private currentActionDescription: Phaser.GameObjects.Text;
    private curentActionZone: Phaser.GameObjects.Zone;
    private table: Phaser.GameObjects.Image;
    private tablePlayers: TablePlayer[] = [];
    private vsPlayerPanels: VsPlayerPanel[] = [];

    // Game updates tweens that need to run sequentially
    private isTweenRunning: false;
    private pendingTweens: (()=>void)[];

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

    private vsPlayerPanelsY = [ 20, 50 , 80];
        
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

        // Table players
        this.addTablePlayers();

         // Set up sending current action to server on confirmation
         engine.OnPendingActionConfirm = () => {
            this.sendWsMessage({
                messageType : GameMessage[GameMessage.Action],
                data : {
                    currentMove: engine.game.currentMove
                }
            });
        };
    }

    // Refresh the game objects based on the current game state
    update(time: any, delta: any) {
        // Show/hide take coins panel buttons
        this.coinsPanel.setVisible(engine.waitingForTakeCoinsConfirmation());

        // Update the current action description text
        this.currentActionDescription.setText(engine.getCurrentActionText());
        Phaser.Display.Align.In.TopCenter(this.currentActionDescription, this.curentActionZone);

        // Update table players text
        for (let player of this.tablePlayers) {
            player.update();
        }

        // Update the vs player planels
        for (let panel of this.vsPlayerPanels) {
            panel.update();
        }
    }

    protected onWsMessage(event) {
        const message = JSON.parse(event.data);
        console.log(message);
        this.messages.push(message);

        switch (message.MessageType) {
            case GameMessage[GameMessage.Action]:
                engine.updateGame(message.Data);
                
                // Here we need to make sure the visual game objects updates
                // that require animations are taking place
                let currentTablePlayer = this.getCurrentTablePlayer();
                switch (engine.game.currentMove.action.actionType) {
                    case ActionType.TakeOneCoin:
                        currentTablePlayer.pushCoin(this.bankCoins.pop());
                        break;
                    case ActionType.TakeTwoCoins:
                        [1,2].forEach(() => currentTablePlayer.pushCoin(this.bankCoins.pop()));
                        break;
                    case ActionType.TakeThreeCoins:
                        [1,2,3].forEach(() => currentTablePlayer.pushCoin(this.bankCoins.pop()));
                        break;
                }
                console.log(engine.game);
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
                tablePlayer.pushCoin(this.bankCoins.pop());
            }

            if (engine.isHeroPlayer(player)) {
                continue;
            }

            // For each active enemy player, add a vs player panel
            let vsPlayerPanel = new VsPlayerPanel(player, this, Constants.gameWidth + 300, 0);

            vsPlayerPanel.OnStealPointerOver = () => {
                tablePlayer.setTint(Constants.redTint);
                engine.steal(player.name);
            };
            vsPlayerPanel.OnStealPointerOut = () => {
                engine.cancelPendingAction();
                tablePlayer.clearTint();
            };
            vsPlayerPanel.OnStealPointerUp = () => {
                engine.confirmPendingAction();
                this.hideVsPlayerPanels();
            };

            vsPlayerPanel.OnAssassinatePointerOver = () => {
                tablePlayer.setTint(Constants.redTint);
                engine.assassinate(player.name);
            };
            vsPlayerPanel.OnAssassinatePointerOut = () => {
                engine.cancelPendingAction();
                tablePlayer.clearTint();
            };
            vsPlayerPanel.OnAssassinatePointerUp  = () => {
                engine.confirmPendingAction();
                this.hideVsPlayerPanels();
            };

            this.add.existing(vsPlayerPanel);
            this.vsPlayerPanels.push(vsPlayerPanel);
        }

        engine.isHeroPlayerTurn() && this.showVsPlayerPanels();
    }

    private getCurrentTablePlayer(): TablePlayer {
        const currentPlayer = engine.game.currentPlayer;

        return this.tablePlayers.find((tablePlayer) => tablePlayer.PlayerName == currentPlayer.name);
    }

    private enqueueTween(callback:() => void) {
        this.pendingTweens.push(callback);
    }

    private startCurrentPlayerTween() {
        if (this.currentPlayerTween) {
            return;
        }

        this.currentPlayerTween = this.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 1000,
            ease: Phaser.Math.Easing.Sine.InOut,
            repeat: -1,
            yoyo: true,
            onUpdate: (tween) => {
                // const value = tween.getValue();
                // const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
                //     Phaser.Display.Color.ValueToColor(Constants.darkGreenTint),
                //     Phaser.Display.Color.ValueToColor(Constants.greenTint),
                //     100,
                //     value
                // );
                // const color = Phaser.Display.Color.GetColor(colorObject.r, colorObject.g, colorObject.b);

                // this.getCurrentTablePlayer().setTint(color);

                if (engine.waitingForAction()) {
                    const value = tween.getValue();
                    const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
                        Phaser.Display.Color.ValueToColor(Constants.darkGreenTint),
                        Phaser.Display.Color.ValueToColor(Constants.greenTint),
                        100,
                        value
                    );
                    const color = Phaser.Display.Color.GetColor(colorObject.r, colorObject.g, colorObject.b);
    
                    this.getCurrentTablePlayer().setTint(color);
                } else {
                    if (engine.waitingForActionConfirmation()) {
                        this.getCurrentTablePlayer().setTint(Constants.yellowTint);
                    } else {
                        this.getCurrentTablePlayer().clearTint();
                    }
                }
            },
        });
    }

    private stopCurrentPlayerTween() {
        this.currentPlayerTween && this.currentPlayerTween.stop();
        this.currentPlayerTween = null;
    }

    private showVsPlayerPanels() {
        let panelIndex = 0;
        this.vsPlayerPanels.forEach((panel) => {
            if (!isEliminated(engine.getPlayerByName(panel.playerName))) {
                panel.setY(this.vsPlayerPanelsY[panelIndex]);
                this.tweens.add({
                    targets: panel,
                    ease: "Back",
                    delay: 500,
                    x: Constants.gameWidth - 230,
                    duration: 1500,
                    onComplete: () => {
                        this.startCurrentPlayerTween();
                    }
                })
                panelIndex++;
            }
        })
    }

    private hideVsPlayerPanels() {
        this.vsPlayerPanels.forEach((panel) => {
            if (!isEliminated(engine.getPlayerByName(panel.playerName))) {
                this.tweens.add({
                    targets: panel,
                    ease: "Back",
                    //delay: 100,
                    x: Constants.gameWidth + 300,
                    duration: 4000                   
                })
            }
        })
    }
}

