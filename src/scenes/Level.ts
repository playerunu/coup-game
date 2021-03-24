export class Level extends Phaser.Scene {
	
	constructor() {
		super("Level");
	}

	create() {
		
		// background
		const background = this.add.image(0, 0, "background");
		
        // Center the background in the game
        Phaser.Display.Align.In.Center(background, this.add.zone(800, 600, 1600, 1200));
		
		// table
		const table = this.add.image(400, 206, "table");

		Phaser.Display.Align.In.Center(table, background);

        const group = this.add.group();
		// Put some random coins on the table
        const coinsArray =[];
        for (let i = 0; i < 30; i++){
            let x = Phaser.Math.Between(760, 830);
            let y = Phaser.Math.Between(570, 630);

            let coin = this.add.image(x, y, "coin").setScale(0.3).setInteractive();
            group.add(coin);
            coinsArray.push(coin);
            coin.on("pointerover", function() {
                for (let cc of coinsArray) {
                    cc.setScale(0.35);
                    cc.setAlpha(0.9);
                }
            });
            coin.on("pointerout", function() {
                for (let cc of coinsArray) {
                    cc.setScale(0.3);
                    cc.clearAlpha();
                }
            });
        }

        group.on("pointerover", function() {
            this.setTint(0x00ff00);
        });
    
	}
}

