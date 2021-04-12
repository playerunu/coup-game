import { Constants } from "./../Constants";
import { GameMessage } from "../core/GameMessage";
import { wsConnection } from "../ws/WsConnection";
import {WsScene} from "./WsScene";
import {engine} from "../core/GameEngine";

export class Lobby extends WsScene {
    create() {
        super.create();

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
                    wsConnection.sendMessage({
                        messageType: GameMessage[GameMessage.PlayerJoined],
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
    }

    onWsMessage(event) {
        const message = JSON.parse(event.data);
        Object.assign(engine.game, message.Data);
        console.log(message.Data);
        console.log(engine.game);

        switch (message.MessageType) {
            case GameMessage[GameMessage.GameStarted]:
                this.startScene("Level");
                break;
        }
    }

}