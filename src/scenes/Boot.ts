import {Constants} from "../Constants";

export class Boot extends Phaser.Scene {
	private socket : WebSocket = null;
	private boundShit: any;

	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
		this.boundShit = this.onMsg.bind(this);
	}

	preload() {

		this.load.pack("cards", "assets/cards.json");
		this.load.pack("environment", "assets/environment.json");
        this.load.pack("buttons", "assets/buttons.json");
        this.load.image("playerBackground", "assets/player-description-background.png");
        this.load.bitmapFont("desyrel", "assets/fonts/desyrel.png", "assets/fonts/desyrel.xml");
        this.load.html("nameform", "assets/html/nameform.html");
	}

	onMsg(ev: any) {
		console.log(ev.data + "2");
		this.socket.removeEventListener("message", this.boundShit);
	}

	create() {
		
		this.scene.start("Lobby");
		
		this.socket.onmessage =( ev:any) => {
			console.log(ev.data);
		};
		this.socket.addEventListener("message", this.boundShit);
		setInterval(() => this.socket.send("kkt"), 1000);
	}
}