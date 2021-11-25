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

        for (const score of endGameData.scores) {
            if (!(await this.isNewScoreGreater(score, collectionName))) {
                return;
            }

            if (await this.scoreService.updateNamesWithSameScore(score, collectionName)) {
                return;
            }
            await this.scoreService.updateScoreboard(score, collectionName);
        }
    }

    async currentGreaterScores(scoreList: Score[], collectionName: string): Promise<Score[]> {
        let listScores: Score[] = [];

        for (let i = 0; i < scoreList.length; i++) {
            if (await this.isNewScoreGreater(scoreList[i], collectionName)) {
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
