import {Coin} from "./Coin";
import {Player} from "../model/Player";
import {Constants} from "../Constants";
import {engine} from "../core/GameEngine";
import { Engine } from "matter";

export class TablePlayer extends Phaser.GameObjects.Container {
    private coins: Coin[] = [];

    private playerName : string;
    get PlayerName() {
        return this.playerName;
    }
    
    private playerDescription: Phaser.GameObjects.Text;
    private playerBackground: Phaser.GameObjects.Image;
    private card1: Phaser.GameObjects.Image = null;
    private card2: Phaser.GameObjects.Image = null;
    
    static readonly COINS_STACK_HEIGHT : number = 40;
    static readonly COIN_OFFSET : number = 20;

    constructor(player: Player, scene, x?, y?, children?) {
        super(scene, x, y, children);

        // Cards
        this.renderCards(player);

        // Player description background
        this.playerBackground = scene.add.image(0, this.card1.height - 3 + TablePlayer.COINS_STACK_HEIGHT, "playerBackground");
        this.add(this.playerBackground);

        this.playerBackground.setOrigin(0,0);

        // Player text description area
        this.playerDescription = scene.add.text(0, 0, "ceva", Constants.defaultTextCss);
        this.add(this.playerDescription);

        Phaser.Display.Align.In.Center(this.playerDescription, this.playerBackground);

        // Player name
        this.setPlayerName(player.name);

        if (engine.isHeroPlayer(player)) {
            this.setupCoinPanelActions();
        }
    }

    pushCoin(coin: Coin, isHeroPlayerAction = false) { 
        this.coins.push(coin);
        if (isHeroPlayerAction) {
            engine.takeCoin();
        }

        this.scene.tweens.add({
            targets: coin,
            x:  this.x + this.coins.length * TablePlayer.COIN_OFFSET,
            y:  this.y,
            duration: 400,
            onComplete: () => {
                // Set player coin properties
                coin.isInBank = false;
                coin.isDragging = false;
                if (isHeroPlayerAction) {
                    coin.setTint(Constants.yellowTint);
                }
            }
        })
    }

    popCoins(count: number, waitingChallenge?: boolean) {
        let popped = 0;
        for (let coin of this.coins) {
            this.popCoin(coin);

            popped++;
            if (popped == count) {
                break;
            }
        }
    }

    update() {
        //this.renderCards(player);
        this.playerDescription.setText(`${this.playerName}\n${this.coins.length} coins`);
    }

    setTint(color) {
        this.playerBackground.setTint(color);
    }

    clearTint() {
        this.playerBackground.clearTint();
    }

    private setPlayerName(playerName:string) {
        this.playerName = playerName;
        this.playerDescription.setText(`${this.playerName}\n${this.coins.length} coins`);
        Phaser.Display.Align.In.TopCenter(this.playerDescription, this.playerBackground);
    }

    private renderCards(player) {
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

    private popCoin(coin: Coin, waitingChallenge: boolean = false) { 
        this.scene.tweens.add({
            targets: coin,
            x:  coin.tableX,
            y:  coin.tableY,
            duration: 300,
            onComplete: () => {
                // Set bank coin properties
                coin.isInBank = true;
                coin.isDragging = false;
                coin.waitingChallenge = waitingChallenge;
                coin.clearTint();
            }
        })
    }

    private setupCoinPanelActions() {
        engine.OnPendingActionConfirm = () => {
            if (!engine.canBlockMove() && !engine.canChallengeMove()){
                this.clearTint();
                for (let coin of this.coins) {
                    coin.waitingChallenge = false;
                    coin.clearTint();
                }
            }
        }
        engine.OnPendingActionCancel = () => {
            this.clearTint();
            
            let coinsToKeep = [];
            let coinsToDiscard = [];
            
            for (let coin of this.coins) {
                if (coin.waitingChallenge) {
                    coinsToDiscard.push(coin);
                } else {
                    coinsToKeep.push(coin);
                }
            }

            this.coins = coinsToKeep;
            for (let coin of coinsToDiscard) {
                this.popCoin(coin);
            }
        }
    }
}