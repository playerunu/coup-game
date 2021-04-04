import {Constants} from "../Constants";
import {Coin} from "../objects/Coin";
import { EnemyPlayer } from "../objects/EnemyPlayer";
import { HeroPlayer } from "../objects/HeroPlayer";

export class Level extends Phaser.Scene {
	private bankCoins : Coin[] = [];
    public heroPlayer : HeroPlayer;
    public enemyPlayers : EnemyPlayer[] = [];

	create() {
		this.input.setDefaultCursor("url(assets/hand-move-no-grab.cur), pointer");
        
        const baseWidth = Constants.gameWidth;
        const baseHeight = Constants.gameHeight;

		// Background
		const background = this.add.image(0, 0, "background");
		
        // Center the background in the game
        Phaser.Display.Align.In.Center(background, this.add.zone(baseWidth/2, 
            baseHeight/2, 
            baseWidth, 
            baseHeight));
		
		// Table
		const table = this.add.image(baseWidth/4, baseHeight/4, "table");

		Phaser.Display.Align.In.Center(table, background);

        
		// Put some random coins on the table
        for (let i = 0; i < Constants.coninsTotal; i++){
            let x = Phaser.Math.Between(baseWidth/2 - 80, baseWidth/2 + 80);
            let y = Phaser.Math.Between(baseHeight/2 - 50, baseHeight/2 + 50);
            
            const coin = new Coin(this, x, y);
            this.add.existing(coin);
            this.bankCoins.push(coin);
        }

        // Place the hero player
        this.heroPlayer = new HeroPlayer(this, baseWidth/2 - 40, baseHeight/2 + 150);
        this.heroPlayer.setPlayerName("PLayer_unu");
        this.add.existing(this.heroPlayer);

        // Place the enemy players
        let enemyPlayer = new EnemyPlayer(this, baseWidth/2 - 40, baseHeight/2 - 400);
        enemyPlayer.setPlayerName("GigiKent");
        this.add.existing(enemyPlayer);
        this.enemyPlayers.push(enemyPlayer);

        enemyPlayer = new EnemyPlayer(this, baseWidth/2 - 550, baseHeight/2 - 60);
        enemyPlayer.setPlayerName("DucuBertzi");
        this.add.existing(enemyPlayer);
        this.enemyPlayers.push(enemyPlayer);

        enemyPlayer = new EnemyPlayer(this, baseWidth/2 + 360, baseHeight/2 - 60);
        enemyPlayer.setPlayerName("DauGherle");
        this.add.existing(enemyPlayer);
        this.enemyPlayers.push(enemyPlayer);

        // Give the initial coins to each player
        this.heroPlayer.addCoin(this.bankCoins.pop());
        this.heroPlayer.addCoin(this.bankCoins.pop());

        for (enemyPlayer of this.enemyPlayers) {
            enemyPlayer.addCoin(this.bankCoins.pop());
            enemyPlayer.addCoin(this.bankCoins.pop());
        }
	}
}

