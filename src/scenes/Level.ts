import {Constants} from "../Constants";

export class Level extends Phaser.Scene {
	
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
        const coinsArray =[];
        for (let i = 0; i < 50; i++){
            let x = Phaser.Math.Between(baseWidth/2 - 80, baseWidth/2 + 80);
            let y = Phaser.Math.Between(baseHeight/2 - 50, baseHeight/2 + 50);

            let coin = this.add.image(x, y, "coin")
                .setScale(0.3)
                .setAngle(Phaser.Math.Between(0, 360))
                .setInteractive();

            coinsArray.push(coin);
            
            coin.on("pointerdown", () =>  {
                this.input.setDefaultCursor("url(assets/hand-move-grab.cur), pointer");
            });

            coin.on("pointerover", function() {
                for (let cc of coinsArray) {
                    cc.setTint(0x44ff44);
                }
            });

            coin.on("pointerup", () => {
                this.input.setDefaultCursor("url(assets/hand-move-no-grab.cur), pointer");
                
            });

            coin.on("pointerout", function() {
                for (let cc of coinsArray) {
                    cc.clearTint();
                }
            });
        }
	}
}

