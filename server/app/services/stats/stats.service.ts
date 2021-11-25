import { ScoreService } from '@app/services/score/score.service';
import { GameMode, Score } from '@common';
import { Service } from 'typedi';
import logger from 'winston';
import { EndGameData } from '@app/classes/end-game-data';

const DATABASE_COLLECTION_CLASSIC = 'classicScoreboard';
const DATABASE_COLLECTION_LOG = 'logScoreboard';

@Service()
export class StatsService {
    constructor(readonly scoreService: ScoreService) {}

    async updateScoreboards(endGameData: EndGameData): Promise<void> {
        const collectionName = endGameData.gameMode === GameMode.Classic ? DATABASE_COLLECTION_CLASSIC : DATABASE_COLLECTION_LOG

        // check if human player
        logger.info(`isHuman: ${endGameData.isWinnerHuman}`);
        if (!endGameData.isWinnerHuman) {
            return;
        }

        // check if already in board and if score in board greater than current score; if not, treat it as if it were a whole new player
        const isScoreGreater = await this.isNewScoreGreater(endGameData, collectionName);
        logger.info(`isScoreGreater: ${isScoreGreater}`);
        if (!(await this.isNewScoreGreater(endGameData, collectionName))) {
            return;
        }

        const playersNewBestScore: Score = endGameData.winnerScore;

        const isUpdateSameNames = await this.scoreService.updateNamesWithSameScore(playersNewBestScore, collectionName);
        logger.info(`isUpdateSameNames: ${isUpdateSameNames}`);
        // check if same score as another player TO DO: Not sure abt this structure... maybe separating the check from the update would be best? idk
        if (await this.scoreService.updateNamesWithSameScore(playersNewBestScore, collectionName)) {
            return;
        }

        // if score unique, update the whole score board
        logger.info('before updateScoreboard');
        this.scoreService.updateScoreboard(playersNewBestScore, collectionName);
    }

    async getScoreboardClassic(): Promise<Score[]> {
        return this.scoreService.getScoreboardClassic();
    }

    async getScoreBoardLog(): Promise<Score[]> {
        return this.scoreService.getScoreboardLog();
    }

    private async isNewScoreGreater(winnerData: EndGameData, collectionName: string): Promise<boolean> {
        const isInScoreboard = await this.scoreService.isPlayerInScoreboard(winnerData.winnerScore.name[0], collectionName);

        if (isInScoreboard) {
            const playerScoreInBoard = await this.scoreService.getPlayerScore(winnerData.winnerScore.name[0], collectionName);
            if (playerScoreInBoard > winnerData.winnerScore.scoreValue) {
                return false;
            }
        }
        return true;
    }
}
