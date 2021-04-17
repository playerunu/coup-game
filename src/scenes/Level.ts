import { Constants } from "../Constants";
import { Coin } from "../game-objects/Coin";
import { TablePlayer } from "../game-objects/TablePlayer";
import { GameMessage } from "../core/GameMessage";
import { engine } from "../core/GameEngine";
import { VsPlayerPanel } from "../game-objects/VsPlayerPanel";
import { TakeCoinsPanel } from "../game-objects/TakeCoinsPanel";

export class Level extends Phaser.Scene {
    private bankCoins: Coin[] = [];
    public heroPlayer: TablePlayer;
    public enemyPlayers: TablePlayer[] = [];

    private enemyPlayersXY = [
        { x: -40, y: -400 },
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
        Phaser.Display.Align.In.Center(background, this.add.zone(baseWidth / 2,
            baseHeight / 2,
            baseWidth,
            baseHeight));

        // Table
        const table = this.add.image(baseWidth / 4, baseHeight / 4, "table");

        Phaser.Display.Align.In.Center(table, background);

        // Put some random coins on the table
        for (let i = 0; i < engine.game.tableCoins; i++) {
            let x = Phaser.Math.Between(baseWidth / 2 - 80, baseWidth / 2 + 80);
            let y = Phaser.Math.Between(baseHeight / 2 - 50, baseHeight / 2 + 50);

            const coin = new Coin(this, x, y);
            this.add.existing(coin);
            this.bankCoins.push(coin);
        }

        const coinsPanel = new TakeCoinsPanel(this, baseWidth / 2, baseHeight / 2 -100);
        this.add.existing(coinsPanel);

        // Place the hero player
        this.heroPlayer = new TablePlayer(engine.getHeroPlayer(), this, baseWidth / 2 - 40, baseHeight / 2 + 150);
        this.add.existing(this.heroPlayer);

        let maxNameLength = Math.max(...engine.game.players.map(player => player.name.length), 0);

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
            let vsPlayerPanel = new VsPlayerPanel(player, maxNameLength, this, x, y);
            
            vsPlayerPanel.OnStealPointerOver = () => {
                enemyPlayer.setTint();
            };
            vsPlayerPanel.OnStealPointerOut = () => {
                enemyPlayer.clearTint();
            };
            vsPlayerPanel.OnAssassinatePointerOver = () => {
                enemyPlayer.setTint();
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

    onWsMessage(event) {
        const message = JSON.parse(event.data);
        console.log(message);

        switch (message.MessageType) {
            case GameMessage[GameMessage.GameStarted]:
                break;
        }
    }
}

