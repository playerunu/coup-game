import 'phaser';
import { Level } from "./scenes/Level";
import { Boot } from "./scenes/Boot";
import { Lobby } from "./scenes/Lobby";
import { Constants } from "./Constants";
import { engine } from "./core/GameEngine";

export const debugGameData = {
    "players": [
        {
            "name": "DauGherle",
            "card1": {
                "isRevealed": false
            },
            "card2": {
                "isRevealed": false
            },
            "id": "",
            "coins": 2,
            "gamePosition": 1
        },
        {
            "id": "",
            "name": "Bombardieru",
            "card1": {
                "influence": 2,
                "isRevealed": true
            },
            "card2": {
                "influence": 3,
                "isRevealed": true
            },
            "coins": 0,
            "gamePosition": 2
        },
        {
            "id": "",
            "name": "DucuBertzi",
            "card1": {
                "isRevealed": false
            },
            "card2": {
                "isRevealed": false
            },
            "coins": 10,
            "gamePosition": 3
        },
        {
            "id": "",
            "name": "PLayer_unu",
            "card1": {
                "influence": 0,
                "isRevealed": false
            },
            "card2": {
                "influence": 4,
                "isRevealed": true
            },
            "coins": 2,
            "gamePosition": 0
        }
    ],
    "currentPlayer": {
        "id": "",
        "name": "PLayer_unu",
        "card1": {
            "isRevealed": false
        },
        "card2": {
            "isRevealed": false
        },
        "coins": 2,
        "gamePosition": 0
    },
    "playerActions": [],
    "tableCoins": 44
};

class Game {
    public useDebugData = true;

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

    constructor() {
        this.init();
    }

    private init() {
        const game = new Phaser.Game(this.gameConfig);

        game.events.on("ready", () => {
            let nextScene = "Lobby";
            if (this.useDebugData) {
                engine.updateGame(debugGameData);
                engine.heroPlayerName = "PLayer_unu";
                nextScene = "Level";
            }

            let bootScene = game.scene.add("Boot", Boot);
            game.scene.add("Lobby", Lobby);
            game.scene.add("Level", Level);

            (bootScene as any).nextScene = nextScene;
            game.scene.start(bootScene);
        });
    }
}

export const game = new Game();

