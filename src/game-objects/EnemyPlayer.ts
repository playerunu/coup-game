import {Coin} from "./Coin";
import {Influence} from "../model/Influence";
import {Player} from "../model/Player";

export class EnemyPlayer extends Phaser.GameObjects.Container {
    private revealedCards : Influence[] = [];
    private coins: Coin[] = [];

    private playerName : string;
    
    private playerDescription: Phaser.GameObjects.Text;
    private playerBackground: Phaser.GameObjects.Image;
    
    static readonly COINS_STACK_HEIGHT : number = 40;
    static readonly COIN_OFFSET : number = 20;

    constructor(player: Player, scene, x?, y?, children?) {
        super(scene, x, y, children);
        
        // Cards
        const card1 = scene.add.image(0, EnemyPlayer.COINS_STACK_HEIGHT,"back");
        const card2 = scene.add.image(card1.width-5, EnemyPlayer.COINS_STACK_HEIGHT, "back");
        
        this.add(card1);
        this.add(card2);

        card1.setOrigin(0,0);
        card2.setOrigin(0,0);
        
        // Player description background
        this.playerBackground = scene.add.image(0, card1.height - 3 + EnemyPlayer.COINS_STACK_HEIGHT, "playerBackground");
        this.add(this.playerBackground);

        this.playerBackground.setOrigin(0,0);

        // Player text description area
        this.playerDescription = scene.add.text(0, 0, "ceva", { font: "16px Arial Black", fill: "#000" });
        this.add(this.playerDescription);

        Phaser.Display.Align.In.Center(this.playerDescription, this.playerBackground);

        // Player name
        this.setPlayerName(player.name);
    }

    setPlayerName(playerName:string) {
        this.playerName = playerName;
        this.playerDescription.setText(this.playerName);
        Phaser.Display.Align.In.TopCenter(this.playerDescription, this.playerBackground);
    }

    addCoin(coin: Coin) { 
        this.scene.tweens.add({
            targets: coin,
            x:  this.x,
            y:  this.y,
            duration: 300,
            onComplete: () => {
                this.add(coin);
                coin.setX(this.coins.length * EnemyPlayer.COIN_OFFSET).setY(0);
                this.coins.push(coin);
                coin.isInBank = false;
                this.playerDescription.setText(this.playerName + "\n" + this.coins.length + " coins");
            }
        })
    }

    setTint() {
        this.playerBackground.setTint(0x44ff44);
    }
    
}