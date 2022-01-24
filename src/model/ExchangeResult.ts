import { TwoCards } from "./Card"
import { Player } from "./Player"

export type ExchangeResult = {
    player: Player;
    playerCards: TwoCards;
    deckCards: TwoCards;
}