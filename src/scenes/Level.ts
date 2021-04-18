import { Constants } from "../Constants";
import { Player } from "../model/Player";
import { GameMessage } from "../core/GameMessage";
import { engine } from "../core/GameEngine";
import { Coin } from "../game-objects/Coin";
import { TablePlayer } from "../game-objects/TablePlayer";
import { VsPlayerPanel } from "../game-objects/VsPlayerPanel";
import { TakeCoinsPanel } from "../game-objects/TakeCoinsPanel";

export class Level extends Phaser.Scene {
    private bankCoins: Coin[] = [];
    private coinsPanel: TakeCoinsPanel;
    private currentPlayerTween: Phaser.Tweens.Tween;
    private currentActionDescription: Phaser.GameObjects.Text;
    private curentActionZone: Phaser.GameObjects.Zone;
    private table: Phaser.GameObjects.Image;
    public tablePlayers: TablePlayer[] = [];

    get HeroPlayer() {
        return this.tablePlayers[0];
    }

    private tablePlayersXY = [
        { x: -75, y: +150 },
        { x: -75, y: -400 },
        { x: -550, y: -60 },
        { x: +360, y: -60 },
    ];

    private vsPlayerPanelXY = [
        { x: 0, y: 20 },
        { x: 0, y: 50 },
        { x: 0, y: 80 },
    ];

    create() {
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

        // Coins panel
        this.coinsPanel = new TakeCoinsPanel(this, halfWidth, halfHeight - 100);
        this.coinsPanel.setVisible(false);
        this.add.existing(this.coinsPanel);

        // Table players
        this.addTablePlayers();
    }

    // Refresh the game objects based on the current game state
    update() {
        const currentTablePlayer: TablePlayer = this.getCurrentTablePlayer();

        // Highlight the current player until he acts
        if (engine.waitingForAction()) {
            if (!this.currentPlayerTween) {
                this.currentPlayerTween = this.startCurrentPlayerTween();
            }
        } else {
            this.currentPlayerTween.stop();

            if (engine.waitingForActionConfirmation()) {
                this.getCurrentTablePlayer().setTint(Constants.yellowTint);
            } else {
                this.getCurrentTablePlayer().clearTint();
            }
        }

        // Show/hide take coins panel buttons
        this.coinsPanel.setVisible(!!engine.pendingPlayerAction);

        // Show/hide the current action description text
        this.currentActionDescription.setText(engine.getCurrentActionText());
        Phaser.Display.Align.In.TopCenter(this.currentActionDescription, this.curentActionZone);
    }

    onWsMessage(event) {
        const message = JSON.parse(event.data);
        console.log(message);

        switch (message.MessageType) {
            case GameMessage[GameMessage.GameStarted]:
                break;
        }
    }

    private addTablePlayers() {
        for  (let tableIndex = 0; tableIndex < engine.game.players.length; tableIndex++) {
            const player = engine.game.players.find((p => p.gamePosition === tableIndex));;

            let x = Constants.gameWidth / 2 + this.tablePlayersXY[tableIndex].x;
            let y = Constants.gameHeight / 2 + this.tablePlayersXY[tableIndex].y;
            let tablePlayer = new TablePlayer(player, this, x, y);
            this.tablePlayers.push(tablePlayer);
            this.add.existing(tablePlayer);

            // Draw the coins
            for (let index = 0; index < player.coins; index++) {
                tablePlayer.pushCoin(this.bankCoins.pop());
            }
             
            if (engine.isHeroPlayer(player)){
                continue;
            }

            // For each active enemy player, add a vs player panel
             x = Constants.gameWidth - 230;
             y = 0 + this.vsPlayerPanelXY[tableIndex - 1].y;
             let vsPlayerPanel = new VsPlayerPanel(player, this, x, y);
 
             vsPlayerPanel.OnStealPointerOver = () => {
                tablePlayer.setTint(Constants.redTint);
             };
             vsPlayerPanel.OnStealPointerOut = () => {
                tablePlayer.clearTint();
             };
             vsPlayerPanel.OnAssassinatePointerOver = () => {
                tablePlayer.setTint(Constants.redTint);
             };
             vsPlayerPanel.OnAssassinatePointerOut = () => {
                tablePlayer.clearTint();
             };
 
             this.add.existing(vsPlayerPanel);
        }
    }

    private getCurrentTablePlayer(): TablePlayer {
        const currentPlayer = engine.game.currentPlayer;
        
        return this.tablePlayers.find((tablePlayer) => tablePlayer.PlayerName == currentPlayer.name);
    }

    private startCurrentPlayerTween(): Phaser.Tweens.Tween {
        return this.tweens.addCounter(
            {
                from: 0,
                to: 100,
                duration: 1000,
                ease: Phaser.Math.Easing.Sine.InOut,
                repeat: -1,
                yoyo: true,
                onUpdate: (tween) => {
                    const value = tween.getValue();
                    const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
                        Phaser.Display.Color.ValueToColor(Constants.darkGreenTint),
                        Phaser.Display.Color.ValueToColor(Constants.greenTint),
                        100,
                        value
                    );
                    const color = Phaser.Display.Color.GetColor(colorObject.r, colorObject.g, colorObject.b);

                    this.getCurrentTablePlayer().setTint(color);
                },
            }
        )
    }
}

