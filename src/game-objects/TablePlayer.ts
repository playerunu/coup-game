import {Coin} from "./Coin";
import {Player} from "../model/Player";
import {Constants} from "../Constants";
import {engine} from "../core/GameEngine";

export class TablePlayer extends Phaser.GameObjects.Container {
    private coins: Coin[] = [];

    private playerName : string;
    
    private playerDescription: Phaser.GameObjects.Text;
    private playerBackground: Phaser.GameObjects.Image;
    private card1: Phaser.GameObjects.Image = null;
    private card2: Phaser.GameObjects.Image = null;
    
    static readonly COINS_STACK_HEIGHT : number = 40;
    static readonly COIN_OFFSET : number = 20;

    constructor(player: Player, scene, x?, y?, children?) {
        super(scene, x, y, children);

        // Cards
        this.drawCards(player);

        // Player description background
        this.playerBackground = scene.add.image(0, this.card1.height - 3 + TablePlayer.COINS_STACK_HEIGHT, "playerBackground");
        this.add(this.playerBackground);

        this.playerBackground.setOrigin(0,0);

        // Player text description area
        this.playerDescription = scene.add.text(0, 0, "ceva", { font: "16px Arial Black", fill: "#000" });
        this.add(this.playerDescription);

        Phaser.Display.Align.In.Center(this.playerDescription, this.playerBackground);

        // Player name
        this.setPlayerName(player.name);
    }

    pushCoin(coin: Coin) { 
        this.scene.tweens.add({
            targets: coin,
            x:  this.x,
            y:  this.y,
            duration: 300,
            onComplete: () => {
                this.add(coin);
                coin.setX(this.coins.length * TablePlayer.COIN_OFFSET).setY(0);
                this.coins.push(coin);
                coin.isInBank = false;
                coin.isDragging = false;
                this.playerDescription.setText(this.playerName + "\n" + this.coins.length + " coins");
            }
        })
    }

    popCoin(coin: Coin) { 
        this.scene.tweens.add({
            targets: coin,
            x:  this.x,
            y:  this.y,
            duration: 300,
            onComplete: () => {
                this.add(coin);
                coin.setX(this.coins.length * TablePlayer.COIN_OFFSET).setY(0);
                this.coins.push(coin);
                coin.isInBank = false;
                coin.isDragging = false;
                coin.setTint(Constants.redTint);
                this.playerDescription.setText(this.playerName + "\n" + this.coins.length + " coins");
            }
        })
    }

    update(player: Player) {
        this.drawCards(player);
    }

    setTint() {
        this.playerBackground.setTint(Constants.greenTint);
    }

    clearTint() {
        this.playerBackground.clearTint();
    }

    private setPlayerName(playerName:string) {
        this.playerName = playerName;
        this.playerDescription.setText(this.playerName);
        Phaser.Display.Align.In.TopCenter(this.playerDescription, this.playerBackground);
    }

    private drawCards(player) {
        let {card1Img, card2Img} = engine.getCardInfluencesStr(player);

        // Create the image objects if they don't exist
        if (this.card1 == null && this.card2 == null) {
            this.card1 = this.scene.add.image(0, TablePlayer.COINS_STACK_HEIGHT, card1Img).setOrigin(0,0);
            this.card2 = this.scene.add.image(this.card1.width-5, TablePlayer.COINS_STACK_HEIGHT, card2Img).setOrigin(0,0);
            
            this.add(this.card1);
            this.add(this.card2);
        }

        this.card1.setTexture(card1Img);
        this.card2.setTexture(card2Img);

        if (player.card1.isRevealed) {
            this.card1.setAlpha(0.7);
        } 

        if (player.card2.isRevealed) {
            this.card2.setAlpha(0.7);
        }
    }
}