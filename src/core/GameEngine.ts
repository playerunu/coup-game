import {Game} from "../model/Game";
import {Card} from "../model/Card";
import {Influence} from "../model/Influence";
import {Player} from "../model/Player";
import {influenceToString} from "../model/Influence";
import {deepMerge} from "../utils/deepMerge";

export class GameEngine {
    // Intial game state is empty,  it will be populated by incremental updates from the back-end
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
                case "players":
                    for (let player of source.players) {
                        let gamePlayer = game.players.find(p => p.name == player.name);
                        if (gamePlayer) {
                            // If the player already exists, merge the update
                            deepMerge(gamePlayer, player);
                        } else {
                            // If the player does not exists, add the update obj to the array
                            game.players.push(player);
                        }
                    }
                    break;
                
                case "currentPlayer":
                    deepMerge(game.currentPlayer, source.currentPlayer);
                    break;
                
                case "playerActions":
                    break;
                
                case "tableCoins":
                    game.tableCoins = source.tableCoins;
                    break;
            }
        }
    }
    
    // Sets hero player full card details
    // If the player is not fund, it will create it
    setHeroPlayerCards(cards:any) {
        // Extract the cards and convert the influence from string to enum
        let {card1, card2} = cards;
        card1.influence = Influence[card1.influence];
        card2.influence = Influence[card2.influence];

        // Lookup if the player already exists in game state
        let heroPlayer = this.getHeroPlayer();

        // Player not found, create it 
        if (heroPlayer == null){
            heroPlayer = {
                name: this.heroPlayerName,
            }
        }

        heroPlayer.card1 = card1;
        heroPlayer.card2 = card2;

        this.updateGame({"players":[heroPlayer]});
    }

    isHeroPlayer(player: Player){
        return player.name == this.heroPlayerName;
    }

    getHeroPlayer(): Player {
        let heroPlayer: Player = null;

        for (const player of this.game.players) {
            if (this.isHeroPlayer(player)){
                heroPlayer = player;
                break;
            }
        }

        return heroPlayer;
    }

    getCardInfluencesStr(player: Player): {card1Img: string, card2Img: string} {
        let card1Img: string;
        let card2Img: string;
        
        if (engine.isHeroPlayer(player)){
            card1Img = influenceToString(player.card1.influence);
            card2Img = influenceToString(player.card2.influence);
        } else {
            card1Img = player.card1.isRevealed? influenceToString(player.card1.influence) : "back";
            card2Img = player.card2.isRevealed? influenceToString(player.card2.influence) : "back";
        }

        return {
            card1Img, 
            card2Img
        }
    }
}

export const engine= new GameEngine();