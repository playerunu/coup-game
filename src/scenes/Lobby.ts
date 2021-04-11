import { Constants } from "./../Constants";
import { MessageTypes } from "../enums/MessageTypes";
import { game } from "../Game";

export class Lobby extends Phaser.Scene {
    private OnWsMessage: any;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.OnWsMessage = this.onWsMessage.bind(this);
    }

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

        // Game title
        let gameTitle = this.add.bitmapText(baseWidth / 2, 100, "desyrel", "COUP", 100);
        gameTitle.setOrigin(0.5, 0);
        gameTitle.setVisible(false);

        // Name form
        let text = this.add.text(baseWidth / 2, 10, "Please enter your name", { color: "black", fontSize: "20px" });
        text.setOrigin(0.5, 0);

        let nameForm = this.add.dom(baseWidth / 2, 0).createFromCache("nameform");

        nameForm.addListener("click");
        nameForm.on("click", function (event) {
            if (event.target.name === "playButton") {
                let inputText = this.getChildByName("nameField");

                if (inputText.value != "") {
                    this.removeListener("click");
                    this.setVisible(false);
                    text.setText("Welcome " + inputText.value);
                    gameTitle.setVisible(true);
                    game.sendMessage({
                        messageType: MessageTypes[MessageTypes.PlayerJoined],
                        data: {
                            name: inputText.value
                        }
                    });
                } else {
                    this.scene.tweens.add({
                        targets: text,
                        alpha: 0.2,
                        duration: 250,
                        ease: "Power3",
                        yoyo: true
                    });
                }
            }
        });

        this.tweens.add({
            targets: nameForm,
            y: baseHeight / 2,
            duration: 3000,
            ease: "Power3"
        });

        // Init WS listener
        game.webSocket.addEventListener("message", this.OnWsMessage);
    }

    onWsMessage(event) {
        const message = JSON.parse(event.data);
        console.log(message);

        switch (message.MessageType) {
            case MessageTypes[MessageTypes.GameStarted]:
                game.webSocket.removeEventListener("message", this.OnWsMessage);
                this.scene.start("Level");
                break;
        }
    }

}