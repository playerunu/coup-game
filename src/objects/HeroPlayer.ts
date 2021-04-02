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

        // Cards
        const card1 = scene.add.image(0, 0,"ambassador");
        const card2 = scene.add.image(card1.width-5, 0, "contessa");
        
        this.add(card1);
        this.add(card2);

        card1.setOrigin(0,0);
        card2.setOrigin(0,0);
        
        // Player description background
        this.playerBackground = scene.add.image(0, card1.height - 3, "playerBackground");
        this.add(this.playerBackground);

        this.playerBackground.setOrigin(0,0);

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
        console.log(this.x + " " + this.y);
        this.scene.tweens.add({
            targets: coin,
            x:  this.x,
            y:  this.y,
            duration: 300,
        })
    }
}