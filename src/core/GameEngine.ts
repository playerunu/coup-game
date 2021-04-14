import {Game} from "../model/Game";
import {Card} from "../model/Card";
import {Player} from "../model/Player";
import {keyToString} from "../utils/keyToString";
import {deepMerge} from "../utils/deepMerge";

export class GameEngine {
    // Intial game state is empty, it will be populated by incremental updates from the back-end
    game: Game = { 
        players: [],
        currentPlayer: {},
        playerActions: [],
        tableCoins: 0,
    }

    public heroPlayerName: string;

    updateGame(source: any) {
        let game = this.game;
        for (const key in source) {
            // We use keyToString helper function here in order to force
            // a strongly-typed check on each of the game keys 
            switch(key) {
                case keyToString(game, game.players):

                    break;
                case keyToString(game, game.currentPlayer):
                    deepMerge(game.currentPlayer, source[key]);
                    break;
                case keyToString(game, game.playerActions):
                    break;
                case keyToString(game, game.tableCoins):
                    break;

            }
        }
        return 0;
    }
    
    setHeroPlayerCards(cards: Card[]) {
        // Lookup if the player already exists in game state
        let heroPlayer: Player = null;

        for (const player of this.game.players) {
            if (this.isHeroPlayer(player)){
                heroPlayer = player;
                break;
            }
        }

        // Player not found, create it 
        if (heroPlayer == null){
            heroPlayer = {
                name: this.heroPlayerName,
                cards: []
            }
        }

        heroPlayer.cards = cards;
    }

    isHeroPlayer(player: Player){
        return player.name == this.heroPlayerName;
    }
}

export const engine= new GameEngine();