import { Constants } from "./../Constants";
import { engine } from "../core/GameEngine";
import { GameMessage } from "../core/GameMessage";
import { Player } from "../model/Player";
import { wsConnection } from "../ws/WsConnection";
import { WsScene } from "./WsScene";
import { deepMerge } from "../utils/deepMerge";


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
        engine.heroPlayerName = Date.now().toString();

        this.sendWsMessage(
            {
                messageType: GameMessage[GameMessage.PlayerJoined],
                data: {
                    name: engine.heroPlayerName
                }      
            }
        );

        // let text = this.add.text(baseWidth / 2, 10, "Please enter your name", { color: "black", fontSize: "20px" });
        // text.setOrigin(0.5, 0);

        // let nameForm = this.add.dom(baseWidth / 2, baseHeight / 2).createFromCache("nameform");
        // let me = this;

        // nameForm.addListener("click");
        // nameForm.on("click", function (event) {
        //     if (event.target.name === "playButton") {
        //         let inputText = this.getChildByName("nameField");

        //         if (inputText.value != "") {
        //             this.removeListener("click");
        //             this.setVisible(false);
        //             engine.heroPlayerName = inputText.value;
        //             text.setText("Welcome " + engine.heroPlayerName);
        //             gameTitle.setVisible(true);
        //             me.sendWsMessage({
        //                 messageType: GameMessage[GameMessage.PlayerJoined],
        //                 data: {
        //                     name: engine.heroPlayerName
        //                 }
        //             });
        //         } else {
        //             this.scene.tweens.add({
        //                 targets: text,
        //                 alpha: 0.2,
        //                 duration: 250,
        //                 ease: "Power3",
        //                 yoyo: true
        //             });
        //         }
        //     }
        // });

        // this.tweens.add({
        //     targets: nameForm,
        //     y: baseHeight / 2,
        //     duration: 3000,
        //     ease: "Power3"
        // });
    }

    protected onWsMessage(event) {
        const message = JSON.parse(event.data);
        console.log("Received game message:", message.Data);

        switch (message.MessageType) {
            case GameMessage[GameMessage.GameStarted]:
                engine.updateGameState(message.Data);
                this.startScene("Level");
                console.log(engine.game);
                break;
            case GameMessage[GameMessage.YourCards]:
                engine.setHeroPlayerCards(message.Data);
                console.log(engine.game);
                break;
        }
    }
}