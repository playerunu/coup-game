import { Constants } from "../Constants";
import { Coin } from "../game-objects/Coin";
import { TablePlayer } from "../game-objects/TablePlayer";
import { GameMessage } from "../core/GameMessage";
import { engine } from "../core/GameEngine";
import { VsPlayerPanel } from "../game-objects/VsPlayerPanel";
import { TakeCoinsPanel } from "../game-objects/TakeCoinsPanel";

export class Level extends Phaser.Scene {
    private bankCoins: Coin[] = [];
    private coinsPanel: TakeCoinsPanel;
    private currentPlayerTween: Phaser.Tweens.Tween;
    private currentActionDescription: Phaser.GameObjects.Text;
    private curentActionZone: Phaser.GameObjects.Zone;
    private table: Phaser.GameObjects.Image;
    public heroPlayer: TablePlayer;
    public enemyPlayers: TablePlayer[] = [];

    private enemyPlayersXY = [
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
        const baseWidth = Constants.gameWidth;
        const baseHeight = Constants.gameHeight;

        // Background
        const background = this.add.image(0, 0, "background");

        // Center the background in the game
        Phaser.Display.Align.In.Center(background, this.add.zone(0,0,baseWidth,baseHeight).setOrigin(0,0));

        // Table
        this.table = this.add.image(baseWidth / 4, baseHeight / 4, "table");
        Phaser.Display.Align.In.Center(this.table, background);

        // Randomly spread the coins on the table
        for (let i = 0; i < engine.game.tableCoins; i++) {
            let x = Phaser.Math.Between(baseWidth / 2 - 80, baseWidth / 2 + 80);
            let y = Phaser.Math.Between(baseHeight / 2 - 50, baseHeight / 2 + 50);

            const coin = new Coin(this, x, y);
            this.add.existing(coin);
            this.bankCoins.push(coin);
        }
        
        // Current action description
        this.curentActionZone = this.add.zone(0,250, baseWidth, baseHeight).setOrigin(0,0);
        this.currentActionDescription =  this.add.text(0, 0, "", { font: "16px Arial Black", color: "#000000" });
        
        // Coins panel
        this.coinsPanel = new TakeCoinsPanel(this, baseWidth / 2, baseHeight / 2 -100);
        this.coinsPanel.setVisible(false);
        this.add.existing(this.coinsPanel);
      
        // Place the hero player
        this.heroPlayer = new TablePlayer(engine.getHeroPlayer(), this, baseWidth / 2 - 75, baseHeight / 2 + 150);
        this.add.existing(this.heroPlayer);

        // Place the enemy players and the vsPlayer panels
        engine.game.players.forEach((player, index) => {
            if (index >= this.enemyPlayersXY.length) {
                return;
            }

            if (engine.isHeroPlayer(player)) {
                return;
            }

            // Enemy player object
            let x = baseWidth / 2 + this.enemyPlayersXY[index].x;
            let y = baseHeight / 2 + this.enemyPlayersXY[index].y;
            let enemyPlayer = new TablePlayer(player, this, x, y);
            this.add.existing(enemyPlayer);
            this.enemyPlayers.push(enemyPlayer);

            // Vs player panel 
            x = baseWidth - 230;
            y = 0 + this.vsPlayerPanelXY[index].y;
            let vsPlayerPanel = new VsPlayerPanel(player, this, x, y);
            
            vsPlayerPanel.OnStealPointerOver = () => {
                enemyPlayer.setTint(Constants.redTint);
            };
            vsPlayerPanel.OnStealPointerOut = () => {
                enemyPlayer.clearTint();
            };
            vsPlayerPanel.OnAssassinatePointerOver = () => {
                enemyPlayer.setTint(Constants.redTint);
            };
            vsPlayerPanel.OnAssassinatePointerOut = () => {
                enemyPlayer.clearTint();
            };

            this.add.existing(vsPlayerPanel);
        });

        // Give the initial coins to each player
        this.heroPlayer.pushCoin(this.bankCoins.pop());
        this.heroPlayer.pushCoin(this.bankCoins.pop());

        for (let enemyPlayer of this.enemyPlayers) {
            enemyPlayer.pushCoin(this.bankCoins.pop());
            enemyPlayer.pushCoin(this.bankCoins.pop());
        }
    }

    // Refresh the game objects based on the current game state
    update() {
        const currentTablePlayer : TablePlayer = this.getCurrentTablePlayer();
        
        // Highlight the current player until he acts
        if (!engine.game.currentPlayerAction && !engine.pendingPlayerAction) {
            if (!this.currentPlayerTween) {
                this.currentPlayerTween = this.startCurrentPlayerTween();
            }
        } else {
            this.stopCurrentPlayerTween();
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

    private getCurrentTablePlayer() : TablePlayer {
        const currentPlayer = engine.game.currentPlayer;
        
        if (engine.isHeroPlayer(currentPlayer)) {
            return this.heroPlayer;
        } else {
            return this.enemyPlayers.find((tablePlayer) => tablePlayer.PlayerName == currentPlayer.name);
        }
    }

    private startCurrentPlayerTween() : Phaser.Tweens.Tween {
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

    private stopCurrentPlayerTween() {
        this.getCurrentTablePlayer().setTint(Constants.greenTint);
        this.currentPlayerTween.stop();
    }
}

