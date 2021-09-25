import { Coin } from "./Coin";
import { Player } from "../model/Player";
import { Constants } from "../Constants";
import { engine } from "../core/GameEngine";
import { influenceToStr } from "../model/Influence";
import { Card } from "../model/Card";

export class TablePlayer extends Phaser.GameObjects.Container {
    private coins: Coin[] = [];

    private player: Player;
    get PlayerName() {
        return this.player.name;
    }

    private playerDescription: Phaser.GameObjects.Text;
    private playerBackground: Phaser.GameObjects.Image;
    private card1: Phaser.GameObjects.Image = null;
    private card2: Phaser.GameObjects.Image = null;

    static readonly COINS_STACK_HEIGHT: number = 40;
    static readonly COIN_OFFSET: number = 20;

    public onPointerOver: (card: Card, carImg: Phaser.GameObjects.Image) => void;
    public onPointerUp: (card: Card, carImg: Phaser.GameObjects.Image) => void;
    public onPointerOut: (card: Card, carImg: Phaser.GameObjects.Image) => void;

    static readonly INITIAL_SCALE: number = 1.0;
    static readonly ON_HOVER_SCALE: number = 1.2;

    constructor(player: Player, scene, x?, y?, children?) {
        super(scene, x, y, children);

        this.player = player;

        // Cards
        this.renderCards(player);

        // Player description background
        this.playerBackground = scene.add.image(0, this.card1.height - 3 + TablePlayer.COINS_STACK_HEIGHT, "playerBackground");
        this.add(this.playerBackground);

        this.playerBackground.setOrigin(0, 0);

        // Player text description area
        this.playerDescription = scene.add.text(0, 0, "ceva", Constants.defaultTextCss);
        this.add(this.playerDescription);

        Phaser.Display.Align.In.Center(this.playerDescription, this.playerBackground);

        // Player name
        this.setPlayerName();

        if (engine.isHeroPlayer(this.player)) {
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
            x: this.x + this.coins.length * TablePlayer.COIN_OFFSET,
            y: this.y,
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
        // TODO use waitingChallenge to set tint on coins 
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
        this.playerDescription.setText(`${this.PlayerName}\n${this.coins.length} coins`);

        let { card1Img, card2Img } = this.getCardsImg(this.player);

        if (this.player.card1.isRevealed) {
            this.card1.setTexture(card1Img);
            this.card1.setAlpha(0.7);
        }

        if (this.player.card2.isRevealed) {
            this.card2.setTexture(card2Img);
            this.card2.setAlpha(0.7);
        }
    }

    setTint(color) {
        this.playerBackground.setTint(color);
    }

    clearTint() {
        this.playerBackground.clearTint();
    }

    private setPlayerName() {
        this.playerDescription.setText(`${this.PlayerName}\n${this.coins.length} coins`);
        Phaser.Display.Align.In.TopCenter(this.playerDescription, this.playerBackground);
    }

    private getCardsImg(player: Player): { card1Img: string, card2Img: string } {
        let card1Img: string;
        let card2Img: string;

        if (engine.isHeroPlayer(player)) {
            card1Img = influenceToStr(player.card1.influence);
            card2Img = influenceToStr(player.card2.influence);
        } else {
            card1Img = player.card1.isRevealed ? influenceToStr(player.card1.influence) : "back";
            card2Img = player.card2.isRevealed ? influenceToStr(player.card2.influence) : "back";
        }

        return {
            card1Img,
            card2Img
        }
    }

    private renderCards(player: Player) {
        let { card1Img, card2Img } = this.getCardsImg(player);

        // Create the image objects if they don't exist
        if (this.card1 == null && this.card2 == null) {
            this.card1 = this.scene.add.image(0, TablePlayer.COINS_STACK_HEIGHT, card1Img).setOrigin(0, 0);
            this.card2 = this.scene.add.image(this.card1.width - 5, TablePlayer.COINS_STACK_HEIGHT, card2Img).setOrigin(0, 0);

            this.add(this.card1);
            this.add(this.card2);
        }

        if (engine.isHeroPlayer(this.player)) {
            this.card1.setInteractive();
            this.card2.setInteractive();
        }
        for (let { card, cardImg } of [{ card: player.card1, cardImg: this.card1 }, { card: player.card2, cardImg: this.card2 }]) {
            cardImg.on("pointerover", () => this.onPointerOver(card, cardImg));
            cardImg.on("pointerout", () => this.onPointerOut(card, cardImg));
            cardImg.on("pointerup", () => this.onPointerUp(card, cardImg));
        }

    }

    private popCoin(coin: Coin, waitingChallenge: boolean = false) {
        this.scene.tweens.add({
            targets: coin,
            x: coin.tableX,
            y: coin.tableY,
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
            if (!engine.canBlockMove() && !engine.canChallengeMove()) {
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