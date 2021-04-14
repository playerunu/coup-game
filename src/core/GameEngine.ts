import {Game} from "../model/Game";

export class GameEngine {
    // Intial game state is empty, it will be populated by incremental updates from the back-end
    game: Game = { 
        players: [],
    }

    public heroPlayerName: string;
}

export const engine= new GameEngine();