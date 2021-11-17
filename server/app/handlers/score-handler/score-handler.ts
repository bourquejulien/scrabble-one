import { Player } from '@app/classes/player/player';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';
export class ScoreHandler {
    constructor() {}

    updateScoreboards(playerHandler: PlayerHandler): void {
        let winnerId = playerHandler.winner;
        let playerWinner: Player;
        playerWinner = playerHandler.players[0].id === winnerId ? playerHandler.players[0] : playerHandler.players[1];

        if (!playerWinner.playerInfo.isHuman) {
            return;
        }
        // on access to 'best scores' page , call getScores from score-service.
    }
}
