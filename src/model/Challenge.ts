import { Player } from "./Player"

export type Challenge = {
    challengedBy?: Player;
    success?: boolean;
    waitingReveal?: boolean;
}