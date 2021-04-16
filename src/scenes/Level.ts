import { Constants } from "../Constants";
import { Coin } from "../game-objects/Coin";
import { EnemyPlayer } from "../game-objects/EnemyPlayer";
import { HeroPlayer } from "../game-objects/HeroPlayer";
import {GameMessage} from "../core/GameMessage";
import { engine } from "../core/GameEngine";

export class Level extends Phaser.Scene {
    private bankCoins: Coin[] = [];
    public heroPlayer: HeroPlayer;
    public enemyPlayers: EnemyPlayer[] = [];

    private enemyPlayersXY = [
        {x: -40, y: -400},
        {x: -550, y: -60},
        {x: +360, y: -60},
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

        // Place the hero player
        this.heroPlayer = new HeroPlayer(engine.getHeroPlayer(), this, baseWidth / 2 - 40, baseHeight / 2 + 150);
        this.add.existing(this.heroPlayer);

        // Place the enemy players
        engine.game.players.forEach((player, index) => {
            if (index >= this.enemyPlayersXY.length) {
                return;
            }

            if (engine.isHeroPlayer(player)){
                return;
            }

            let x = baseWidth / 2 + this.enemyPlayersXY[index].x;
            let y = baseHeight / 2 + this.enemyPlayersXY[index].y;

            let enemyPlayer = new EnemyPlayer(player, this, x, y);
            this.add.existing(enemyPlayer);
            this.enemyPlayers.push(enemyPlayer);    
        });
        
        // Give the initial coins to each player
        this.heroPlayer.addCoin(this.bankCoins.pop());
        this.heroPlayer.addCoin(this.bankCoins.pop());

        for (let enemyPlayer of this.enemyPlayers) {
            enemyPlayer.addCoin(this.bankCoins.pop());
            enemyPlayer.addCoin(this.bankCoins.pop());
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

