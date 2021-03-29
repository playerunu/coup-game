import {Coin} from "./Coin";
import {Influence} from "../enums/Influence";

export class HeroPlayer extends Phaser.GameObjects.Container {
    private cards : Influence[] = [Influence.Duke, Influence.Contessa];
    private coins: Coin[] = [];

    private playerName : string;
    
    private playerDescription: Phaser.GameObjects.Text;
    private playerBackground: Phaser.GameObjects.Image;

    constructor(scene, x?, y?, children?) {
        super(scene, x, y, children);

        this.setInteractive();
        // Cards
        const card1 = scene.add.image(0, 40,"ambassador").setScale(0.25);
        const card2 = scene.add.image(card1.width/4 - 5, 40, "contessa").setScale(0.25);
        this.add(card1);
        this.add(card2);
        
        // Player description background
        this.playerBackground = scene.add.image(35, card1.height/4 - 3, "playerBackground");
        this.add(this.playerBackground);

        // Player text
        this.playerDescription = scene.add.text(0, 0, "ceva", { font: "16px Arial Black", fill: "#000" });
        this.add(this.playerDescription);

        Phaser.Display.Align.In.Center(this.playerDescription, this.playerBackground);
    }

    setPlayerName(playerName:string) {
        this.playerName = playerName;
        this.playerDescription.setText(this.playerName);
        Phaser.Display.Align.In.Center(this.playerDescription, this.playerBackground);
    }

    addCoin(coin: Coin) {
        this.scene.tweens.add({
            targets: coin,
            x:  this.x,
            y:  this.y,
            duration: 300,
        })
    }
}