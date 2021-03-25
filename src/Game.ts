import 'phaser';
import { Level } from "./scenes/Level";
import { Constants } from "./Constants";

export default class Boot extends Phaser.Scene {
	preload() {

		this.load.pack("cards", "assets/cards.json");
		this.load.pack("environment", "assets/environment.json");
	}

	create() {
		this.input.setDefaultCursor("url(assets/hand-move-no-grab.cur), pointer");
		this.scene.start("Level");
	}
}

const config = {
	width: Constants.gameWidth,
	height: Constants.gameHeight,
	type: Phaser.AUTO,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	}
};

const game = new Phaser.Game(config);
game.scene.add("Level", Level);
game.scene.add("Boot", Boot, true);