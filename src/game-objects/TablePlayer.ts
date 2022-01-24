import { Coin } from "./Coin";
import { Player, remainingCards } from "../model/Player";
import { Constants } from "../Constants";
import { engine } from "../core/GameEngine";
import { Influence, influenceToStr } from "../model/Influence";
import { Card, TwoCards } from "../model/Card";

enum ExchangeCards {
  Card1 = "Card1",
  Card2 = "Card2",
  Card3 = "Card3",
  Card4 = "Card4",
}

export class TablePlayer extends Phaser.GameObjects.Container {
  private coins: Coin[] = [];

  private player: Player;
  get PlayerName() {
    return this.player.name;
  }

  private playerDescription: Phaser.GameObjects.Text;
  private playerBackground: Phaser.GameObjects.Image;
  private card1Img: Phaser.GameObjects.Image = null;
  private card2Img: Phaser.GameObjects.Image = null;

  // Exchange cards logic
  private card3Img: Phaser.GameObjects.Image = null;
  private card4Img: Phaser.GameObjects.Image = null;
  private confirmExchangeButton: Phaser.GameObjects.Image = null;
  private cardsToKeep: ExchangeCards[] = [];
  private exchangeMapping: Record<ExchangeCards, { card: Card; cardImg: Phaser.GameObjects.Image }> = null;

  static readonly COINS_STACK_HEIGHT: number = 40;
  static readonly COIN_OFFSET: number = 20;

  public onPointerOver: (card: Card, cardImg: Phaser.GameObjects.Image) => void;
  public onPointerUp: (card: Card, cardImg: Phaser.GameObjects.Image) => void;
  public onPointerOut: (card: Card, cardImg: Phaser.GameObjects.Image) => void;

  static readonly INITIAL_SCALE: number = 1.0;
  static readonly ON_HOVER_SCALE: number = 1.2;

  constructor(player: Player, scene, x?, y?, children?) {
    super(scene, x, y, children);

    this.player = player;

    // Cards
    this.renderCards();

    // Player description background
    this.playerBackground = scene.add.image(
      0,
      this.card1Img.height - 3 + TablePlayer.COINS_STACK_HEIGHT,
      "playerBackground"
    );
    this.add(this.playerBackground);

    this.playerBackground.setOrigin(0, 0);

    // Player text description area
    this.playerDescription = scene.add.text(
      0,
      0,
      "ceva",
      Constants.defaultTextCss
    );
    this.add(this.playerDescription);

    Phaser.Display.Align.In.Center(
      this.playerDescription,
      this.playerBackground
    );

    // Player name
    this.setPlayerName();

    if (engine.isHeroPlayer(this.player)) {
      this.setupCoinPanelActions();
      this.confirmExchangeButton = scene.add
        .image(
          this.playerBackground.x + this.playerBackground.width + 10,
          this.playerBackground.y,
          "ok-button"
        )
        .setScale(0.7)
        .setOrigin(0, 0)
        .setInteractive()
        .setVisible(false);

      this.add(this.confirmExchangeButton);

      this.confirmExchangeButton.on("pointerover", () => {
        let toKeep: Card[] = [];
        let toThrow: Card[] = [];

        for (const value of Object.values(ExchangeCards)) {
          const card = this.exchangeMapping[value].card;

          // Revealed card are always kept
          if (card.isRevealed) {
            toKeep.push(card);
            continue;
          }

          if (this.cardsToKeep.includes(value)) {
            toKeep.push(card);
          } else {
            toThrow.push(card);
          }
        }
        let playerCards: TwoCards = {
          card1: toKeep[0],
          card2: toKeep[1],
        };
        let deckCards: TwoCards = {
          card1: toThrow[0],
          card2: toThrow[1],
        };

        engine.sendExchangeResult(playerCards, deckCards);

        this.scene.input.setDefaultCursor("pointer");
        this.confirmExchangeButton.setScale(0.8);
      });

      this.confirmExchangeButton.on("pointerout", () => {
        this.scene.input.setDefaultCursor("default");
        this.confirmExchangeButton.setScale(0.7);
      });

      this.confirmExchangeButton.on("pointerup", () => {
        engine.confirmPendingExchange();
        this.exchangeComplete();
      });
    }
  }

  getCoinFromBank(coin: Coin, isHeroPlayerAction = false) {
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
      },
    });
  }

  stealCoin(coin: Coin) {
    this.coins.push(coin);

    this.scene.tweens.add({
      targets: coin,
      x: this.x + this.coins.length * TablePlayer.COIN_OFFSET,
      y: this.y,
      duration: 400,
      onComplete: () => {
        // Set player coin properties
        coin.isInBank = false;
        coin.isDragging = false;
      },
    });
  }

  getCoinToBeStolen(): Coin[] {
    let coinsToBeStolen: Coin[] = [];
    coinsToBeStolen.push(this.coins.pop());

    if (this.coins.length >= 1) {
      coinsToBeStolen.push(this.coins.pop());
    }

    return coinsToBeStolen;
  }

  moveCoinsToBank(count: number, waitingChallenge?: boolean) {
    // TODO use waitingChallenge to set tint on coins
    for (let i = 0; i < count; i++) {
      let coin = this.coins.pop();
      this.moveCoinToBank(coin);
    }
  }

  update() {
    this.playerDescription.setText(
      `${this.PlayerName}\n${this.coins.length} coins`
    );

    let { card1Img, card2Img } = this.getCardsImg(this.player);

    if (this.player.card1.isRevealed) {
      this.card1Img.setTexture(card1Img);
      this.card1Img.setAlpha(0.7);
    }

    if (this.player.card2.isRevealed) {
      this.card2Img.setTexture(card2Img);
      this.card2Img.setAlpha(0.7);
    }
  }

  setTint(color) {
    this.playerBackground.setTint(color);
  }

  clearTint() {
    this.playerBackground.clearTint();
  }

  private setPlayerName() {
    this.playerDescription.setText(
      `${this.PlayerName}\n${this.coins.length} coins`
    );
    Phaser.Display.Align.In.TopCenter(
      this.playerDescription,
      this.playerBackground
    );
  }

  private getCardsImg(player: Player): { card1Img: string; card2Img: string } {
    let card1Img: string;
    let card2Img: string;

    if (engine.isHeroPlayer(player)) {
      card1Img = influenceToStr(player.card1.influence);
      card2Img = influenceToStr(player.card2.influence);
    } else {
      card1Img = player.card1.isRevealed
        ? influenceToStr(player.card1.influence)
        : "back";
      card2Img = player.card2.isRevealed
        ? influenceToStr(player.card2.influence)
        : "back";
    }

    return {
      card1Img,
      card2Img,
    };
  }

  private renderCards() {
    let { card1Img, card2Img } = this.getCardsImg(this.player);

    // Create the image objects if they don't exist
    if (this.card1Img == null && this.card2Img == null) {
      this.card1Img = this.scene.add
        .image(0, TablePlayer.COINS_STACK_HEIGHT, card1Img)
        .setOrigin(0, 0);
      this.card2Img = this.scene.add
        .image(
          this.card1Img.width - 5,
          TablePlayer.COINS_STACK_HEIGHT,
          card2Img
        )
        .setOrigin(0, 0);

      this.add(this.card1Img);
      this.add(this.card2Img);
    }

    if (engine.isHeroPlayer(this.player)) {
      this.card1Img.setInteractive();
      this.card2Img.setInteractive();
    }
    for (let { card, cardImg } of [
      { card: this.player.card1, cardImg: this.card1Img },
      { card: this.player.card2, cardImg: this.card2Img },
    ]) {
      cardImg.on("pointerover", () => this.onPointerOver(card, cardImg));
      cardImg.on("pointerout", () => this.onPointerOut(card, cardImg));
      cardImg.on("pointerup", () => this.onPointerUp(card, cardImg));
    }
  }

  public renderExchange(card3: Card, card4: Card) {
    const card3Img = influenceToStr(card3.influence);
    const card4Img = influenceToStr(card4.influence);

    this.card3Img = this.scene.add
      .image(2 * this.card2Img.width, TablePlayer.COINS_STACK_HEIGHT, card3Img)
      .setOrigin(0, 0)
      .setInteractive();

    this.card4Img = this.scene.add
      .image(
        3 * this.card2Img.width - 5,
        TablePlayer.COINS_STACK_HEIGHT,
        card4Img
      )
      .setOrigin(0, 0)
      .setInteractive();

    this.add(this.card3Img);
    this.add(this.card4Img);

    this.exchangeMapping = {
      [ExchangeCards.Card1]: {
        card: this.player.card1,
        cardImg: this.card1Img,
      },
      [ExchangeCards.Card2]: {
        card: this.player.card2,
        cardImg: this.card2Img,
      },
      [ExchangeCards.Card3]: { card: card3, cardImg: this.card3Img },
      [ExchangeCards.Card4]: { card: card4, cardImg: this.card4Img },
    };

    for (const exchangeCard of Object.values(ExchangeCards)) {
      const { card, cardImg } = this.exchangeMapping[exchangeCard];

      if (card.isRevealed) {
        continue;
      }

      cardImg.setTint(Constants.yellowTint2).setAlpha(0.7);

      const cardsCount = remainingCards(this.player);

      cardImg.on("pointerup", () => {
        if (this.cardsToKeep.length === cardsCount) {
          // Reset it
          this.cardsToKeep = [];
        }

        this.cardsToKeep.push(exchangeCard);

        // Update all the cards tint
        for (const value of Object.values(ExchangeCards)) {
          if (this.exchangeMapping[value].card.isRevealed) {
            continue;
          }

          if (this.cardsToKeep.includes(value)) {
            this.exchangeMapping[value].cardImg.clearTint().clearAlpha();
          } else {
            this.exchangeMapping[value].cardImg
              .setTint(Constants.yellowTint2)
              .setAlpha(0.7);
          }
        }

        this.confirmExchangeButton.setVisible(
          this.cardsToKeep.length === cardsCount
        );
      });
    }
  }

  public exchangeComplete() {
    for (let cardImg of [
      this.card1Img,
      this.card2Img,
      this.card3Img,
      this.card4Img,
    ]) {
      this.remove(cardImg);
      cardImg.destroy();
    }

    this.confirmExchangeButton.setVisible(false);
    this.card1Img = null;
    this.card2Img = null;
    this.renderCards();
    this.update();
  }

  private getExchangeCardImg(
    exchangeCard: ExchangeCards
  ): Phaser.GameObjects.Image {
    switch (exchangeCard) {
      case ExchangeCards.Card1:
        return this.card1Img;
      case ExchangeCards.Card2:
        return this.card2Img;
      case ExchangeCards.Card3:
        return this.card3Img;
      case ExchangeCards.Card4:
        return this.card4Img;
    }
  }

  private moveCoinToBank(coin: Coin, waitingChallenge: boolean = false) {
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
      },
    });
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
    };
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
        this.moveCoinToBank(coin);
      }
    };
  }
}
