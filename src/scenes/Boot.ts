export class Boot extends Phaser.Scene {
    public nextScene: string;

    preload() {
		this.load.pack("cards", "assets/cards.json");
		this.load.pack("environment", "assets/environment.json");
        this.load.pack("buttons", "assets/buttons.json");
        this.load.image("playerBackground", "assets/player-description-background.png");
        this.load.bitmapFont("desyrel", "assets/fonts/desyrel.png", "assets/fonts/desyrel.xml");
        this.load.html("nameform", "assets/html/nameform.html");
	}

	create() {
		this.scene.start(this.nextScene);
	}
}