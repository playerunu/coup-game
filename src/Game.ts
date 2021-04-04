import 'phaser';
import { Level } from "./scenes/Level";
import { Boot } from "./scenes/Boot";
import { Lobby } from "./scenes/Lobby";
import { Constants } from "./Constants";

const config = {
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

const game = new Phaser.Game(config);

game.scene.add("Boot", Boot, true);
game.scene.add("Lobby", Lobby);
game.scene.add("Level", Level);
