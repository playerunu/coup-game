import {Coin} from "./Coin";
import {Influence} from "../enums/Influence";

export class HeroPlayer extends Phaser.GameObjects.Container {
    private cards : Influence[] = [Influence.Duke, Influence.Contessa];
    private playerName : String;
    private coins: Coin[] = [];

    constructor(scene, x?, y?, children?) {
        super(scene, x, y, children);

        this.setInteractive();
        const card1 = scene.add.image(0, 40,"duke").setScale(0.25);
        const card2 = scene.add.image(card1.width/4 - 5, 40, "contessa").setScale(0.25);
        this.add(card1);
        this.add(card2);
        const playerBackground = scene.add.image(35, card1.height/4 - 3, "playerBackground");
        this.add(playerBackground);
    }

    setPlayerName(playerName:String) {
        this.playerName = playerName;
    }

    addCoin(coin: Coin) {
        this.scene.tweens.add({
            targets: coin,
            x:  Phaser.Math.Between(0, 40),
            y:  Phaser.Math.Between(0, 80),
            duration: 1000,
        })
    }
}