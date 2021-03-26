import {Constants} from "../Constants";
import {Coin} from "../objects/Coin";
import { HeroPlayer } from "../objects/HeroPlayer";

export class Level extends Phaser.Scene {
	private bankCoins : Coin[] = [];
    public heroPlayer : HeroPlayer;

	constructor() {
		super("Level");
	}

	create() {
		
        const baseWidth = Constants.gameWidth;
        const baseHeight = Constants.gameHeight;

		// background
		const background = this.add.image(0, 0, "background");
		
        // Center the background in the game
        Phaser.Display.Align.In.Center(background, this.add.zone(baseWidth/2, 
            baseHeight/2, 
            baseWidth, 
            baseHeight));
		
		// table
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
        this.heroPlayer = new HeroPlayer(this, baseWidth/2 - 40, baseHeight/2 + 200)
        this.add.existing(this.heroPlayer);
	}
}

