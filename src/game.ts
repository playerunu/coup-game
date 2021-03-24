import 'phaser';
import {Level} from "./scenes/Level";

export default class Boot extends Phaser.Scene
{
    preload() {
		
		this.load.pack("cards", "assets/cards.json");
		this.load.pack("environment", "assets/environment.json");
	}

	create() {
		
        this.scene.start("Level");
	}
}

const config = {
    width: 1600,
		height: 1200,
		type: Phaser.AUTO,
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH
		}
};

const game = new Phaser.Game(config);
game.scene.add("Level", Level);
game.scene.add("Boot", Boot, true);