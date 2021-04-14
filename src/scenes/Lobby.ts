import { Constants } from "./../Constants";
import { engine } from "../core/GameEngine";
import { GameMessage } from "../core/GameMessage";
import { Player } from "../model/Player";
import { wsConnection } from "../ws/WsConnection";
import { WsScene } from "./WsScene";


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
                    engine.heroPlayerName = inputText.value;
                    text.setText("Welcome " + engine.heroPlayerName);
                    gameTitle.setVisible(true);
                    wsConnection.sendMessage({
                        messageType: GameMessage[GameMessage.PlayerJoined],
                        data: {
                            name: engine.heroPlayerName
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

    isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    mergeDeep(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) {
                        Object.assign(target, { [key]: {} });
                    } else {
                        target[key] = Object.assign({}, target[key])
                    }
                    this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.mergeDeep(target, ...sources);
    }
      
    onWsMessage(event) {
        console.log(event.data);
        const message = JSON.parse(event.data);
        console.log(message.Data);

        switch (message.MessageType) {
            case GameMessage[GameMessage.GameStarted]:
                this.mergeDeep(engine.game, message.Data);
                this.startScene("Level");
                break;
            case GameMessage[GameMessage.YourCards]:
                let player: Player = {
                    name: engine.heroPlayerName,
                    cards: [],
                }
                Object.assign(player.cards, message.Data);
                engine.game.players = [player];
                console.log(engine.game);
                break;
        }
    }
}