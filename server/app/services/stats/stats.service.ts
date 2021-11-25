import { ScoreService } from '@app/services/score/score.service';
import { Score } from '@common';
import { Service } from 'typedi';
import logger from 'winston';
@Service()
export class StatsService {
    constructor(readonly scoreService: ScoreService) {}

    async updateScoreboards(scoreList: Score[], collectionName: string): Promise<void> {
        const elligiblePlayers = await this.currentGreaterScores(scoreList, collectionName);

        // TO CHANGE (endgameData might become obsolete)
        //const playersNewBestScore: Score[] = [endGameData.winnerScore];
        const isUpdateSameNames = await this.scoreService.updateNamesWithSameScore(playersNewBestScore, collectionName);

        if (await this.scoreService.updateNamesWithSameScore(playersNewBestScore, collectionName)) {
            return;
        }

        // if score unique, update the whole score board
        logger.info('before updateScoreboard');
        this.scoreService.updateScoreboard(playersNewBestScore, collectionName);
    }

    async currentGreaterScores(scoreList: Score[], collectionName: string): Promise<Score[]> {
        let listScores: Score[] = [];

        for (let i = 0; i < scoreList.length; i++) {
            if (await this.isNewScoreGreater(scoreList[i], i, collectionName)) {
                listScores.push(scoreList[i]);
            }
        }

        return listScores;
    }

    async getScoreboardClassic(): Promise<Score[]> {
        return this.scoreService.getScoreboardClassic();
    }

    async getScoreBoardLog(): Promise<Score[]> {
        return this.scoreService.getScoreboardLog();
    }

    private async isNewScoreGreater(score: Score, index: number, collectionName: string): Promise<boolean> {
        const isInScoreboard = await this.scoreService.isPlayerInScoreboard(score.name[index], collectionName);

        if (isInScoreboard) {
            const playerScoreInBoard = await this.scoreService.getPlayerScore(score.name[index], collectionName);
            if (playerScoreInBoard > score.scoreValue) {
                return false;
            }
        }
        return true;
    }

}
