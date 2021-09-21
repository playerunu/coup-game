import { Player } from "./Player"

export type Challenge = {
    challengedBy?: Player;
    success?: boolean;
    waitingReveal?: boolean;
}

export function challengeToStr(challenge: Challenge, vsPlayerName: string, challengedActionStr: string): string {
    const challenger = challenge.challengedBy;

    if ('success' in challenge) {
        if (challenge.success) {
            return `${challenger} won the challenge. Waiting ${vsPlayerName} to reveal a card.`;
        } else {
            return `${challenger} lost the challenge. Waiting ${challenger} to reveal a card.`;
        }
    } else {
        // Still waiting for the challenge result from the server
        return `Challenged by ${challenger} : ${challengedActionStr}`; 
    }
}