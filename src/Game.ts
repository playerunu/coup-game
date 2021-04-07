import 'phaser';
import { Level } from "./scenes/Level";
import { Boot } from "./scenes/Boot";
import { Lobby } from "./scenes/Lobby";
import { Constants } from "./Constants";

class Game {
    private readonly gameConfig = {
        width: Constants.gameWidth,
        height: Constants.gameHeight,
        parent: 'phaser-example',
        type: Phaser.AUTO,
        dom: {
            createContainer: true
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
    };

    private socket : WebSocket = null;
    get webSocket() {
        return this.socket;
    }

    constructor() {
        this.init();
    }

    sendMessage(data) {
        this.socket.send(JSON.stringify(data));
    }

    private init() {
        this.socket = new WebSocket(Constants.wsServerUrl);
        const game = new Phaser.Game(this.gameConfig);

        game.scene.add("Boot", Boot, true);
        game.scene.add("Lobby", Lobby);
        game.scene.add("Level", Level);
    }
}

export const game = new Game();

