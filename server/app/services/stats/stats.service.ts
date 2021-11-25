import { EndGameData } from '@app/classes/end-game-data';
import { ScoreService } from '@app/services/score/score.service';
import { GameMode, Score } from '@common';
import { Service } from 'typedi';

const DATABASE_COLLECTION_CLASSIC = 'classicScoreboard';
const DATABASE_COLLECTION_LOG = 'logScoreboard';
@Service()
export class StatsService {
    constructor(readonly scoreService: ScoreService) {}

    async updateScoreboards(endGameData: EndGameData): Promise<void> {
        const collectionName = endGameData.gameMode === GameMode.Classic ? DATABASE_COLLECTION_CLASSIC : DATABASE_COLLECTION_LOG;
        const elligiblePlayers = await this.currentGreaterScores(endGameData.scores, collectionName);

        for (let i = 0; i < elligiblePlayers.length; i++) {
            if (await this.scoreService.updateNamesWithSameScore(elligiblePlayers[i], collectionName)) {
                elligiblePlayers.splice(i, 1);
            }

            if (elligiblePlayers.length === 0) {
                return;
            }

            await this.scoreService.updateScoreboard(elligiblePlayers, collectionName);
        }
    }

    async currentGreaterScores(scoreList: Score[], collectionName: string): Promise<Score[]> {
        const listScores: Score[] = [];

        for (const score of scoreList) {
            if (await this.isNewScoreGreater(score, collectionName)) {
                listScores.push(score);
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

    private async isNewScoreGreater(score: Score, collectionName: string): Promise<boolean> {
        const isInScoreboard = await this.scoreService.isPlayerInScoreboard(score.name[0], collectionName);

        if (isInScoreboard) {
            const playerScoreInBoard = await this.scoreService.getPlayerScore(score.name[0], collectionName);
            if (playerScoreInBoard > score.scoreValue) {
                return false;
            }
        }
        return true;
    }
}
