import { Coin } from "./Coin";
import { Influence } from "../model/Influence";
import { Player } from "../model/Player";

export class VsPlayerPanel extends Phaser.GameObjects.Container {
    private revealedCards: Influence[] = [];

    private playerName: string;

    private playerDescription: Phaser.GameObjects.Text;
    private playerBackground: Phaser.GameObjects.Image;

    static readonly COINS_STACK_HEIGHT: number = 40;
    static readonly COIN_OFFSET: number = 20;

    private onStealPointerOver : ()=>void;

    constructor(player: Player, descriptionLength, scene, x?, y?, children?) {
        super(scene, x, y, children);



        // Player description background
        //this.playerBackground = scene.add.image(0, card1.height - 3 + EnemyPlayer.COINS_STACK_HEIGHT, "playerBackground");
        //this.add(this.playerBackground);

        //this.playerBackground.setOrigin(0,0);

        // Player text description area
        this.playerDescription = scene.add.text(0, 0, "ceva", { font: "32px Arial Black", fill: "#000" });
        this.add(this.playerDescription);

        //Phaser.Display.Align.In.Center(this.playerDescription, this.playerBackground);

        // Player name
        this.playerName = player.name;
        this.playerDescription.setText(this.playerName.padEnd(descriptionLength, " "));
        // Cards
        const card1 = scene.add.image(200, 0, Influence[Influence.Captain].toLowerCase()).setScale(0.6);
        const card2 = scene.add.image(300 + card1.width + 40, 0, Influence[Influence.Assassin].toLowerCase()).setScale(0.6);

        this.add(card1);
        this.add(card2);

        card1.setOrigin(0, 0);
        card2.setOrigin(0, 0);

        card1.setInteractive();
        card1.on("pointerover", () => {
            this.onStealPointerOver();
            card1.setTint(0x44ff44);
        });

        card1.on("pointerout", () => {
            card1.clearTint();
        });
    }

    OnStealPointerOver( callback ){
        this.onStealPointerOver = callback;
    }
   
}