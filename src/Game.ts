import 'phaser';
import { Level } from "./scenes/Level";
import { Boot } from "./scenes/Boot";
import { Lobby } from "./scenes/Lobby";
import { Constants } from "./Constants";
import { engine } from "./core/GameEngine";

export const debugGameData2 = {
    "players": [
        {
          "name": "PLayer_unu",
          "card1": {
            "influence": 1,
            "isRevealed": false
          },
          "card2": {
            "influence": 4,
            "isRevealed": false
          },
          "coins": 8,
          "gamePosition": 0
        },
        {
          "name": "Serif",
          "card1": {
            "isRevealed": false
          },
          "card2": {
            "isRevealed": false
          },
          "coins": 2,
          "gamePosition": 1
        },
        {
            "name": "DauGherle",
            "card1": {
              "isRevealed": false
            },
            "card2": {
              "isRevealed": false
            },
            "coins": 2,
            "gamePosition": 2
          },
          {
            "name": "DucuBertzi",
            "card1": {
              "isRevealed": false
            },
            "card2": {
              "isRevealed": false
            },
            "coins": 2,
            "gamePosition": 3
          }
      ],
      "remainingPlayers": 0,
      "currentPlayer": {
        "name": "Serif",
        "card1": {
          "isRevealed": false
        },
        "card2": {
          "isRevealed": false
        },
        "coins": 2,
        "gamePosition": 0
      },
    //   "currentMove" : {
    //       "action" : {
    //         "actionType" : 5
    //       },
    //       "vsPlayer" : {
    //         "name": "DauGherle",
    //         "card1": {
    //           "isRevealed": false
    //         },
    //         "card2": {
    //           "isRevealed": false
    //         },
    //         "coins": 2,
    //         "gamePosition": 2
    //       }
    //   },
      "tableCoins": 46
};

export const debugGameData = {
    "players": [
        {
          "name": "PLayer_unu",
          "card1": {
            "influence": 1,
            "isRevealed": false
          },
          "card2": {
            "influence": 4,
            "isRevealed": false
          },
          "coins": 8,
          "gamePosition": 0
        },
        {
          "name": "Serif",
          "card1": {
            "isRevealed": false
          },
          "card2": {
            "isRevealed": false
          },
          "coins": 2,
          "gamePosition": 1
        },
        {
            "name": "DauGherle",
            "card1": {
              "isRevealed": false
            },
            "card2": {
              "isRevealed": false
            },
            "coins": 2,
            "gamePosition": 2
          },
          {
            "name": "DucuBertzi",
            "card1": {
              "isRevealed": false
            },
            "card2": {
              "isRevealed": false
            },
            "coins": 2,
            "gamePosition": 3
          }
      ],
      "remainingPlayers": 0,
      "currentPlayer": {
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
      "tableCoins": 46
};

export const debugGameData3 = {
    "players": [
      {
        "name": "PLayer_unu",
        "card1": {
          "influence": 4,
          "isRevealed": false
        },
        "card2": {
          "influence": 2,
          "isRevealed": false
        },
        "coins": 2,
        "gamePosition": 1
      },
      {
        "name": "baws",
        "card1": {
          "isRevealed": false
        },
        "card2": {
          "isRevealed": false
        },
        "coins": 4,
        "gamePosition": 0
      }
    ],
    "remainingPlayers": 2,
    "currentPlayer": {
      "name": "baws",
      "card1": {
        "isRevealed": false
      },
      "card2": {
        "isRevealed": false
      },
      "coins": 4,
      "gamePosition": 0
    },
    "currentMove": {
      "action": {
        "actionType": 1,
        "canChallenge": false,
        "canBlock": true
      },
      "finished": false,
      "waitingReveal": false,
      "waitinExchange": false,
    },
    "tableCoins": 44
  }

class Game {
    public useDebugData = false;

    private readonly gameConfig = {
        width: Constants.gameWidth,
        height: Constants.gameHeight,
        parent: "phaser-example",
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
                engine.updateGame(debugGameData3);
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

