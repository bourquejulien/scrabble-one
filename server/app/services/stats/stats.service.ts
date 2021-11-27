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

        if (elligiblePlayers.length === 0) {
            return;
        }

        await this.scoreService.updateScoreboard(elligiblePlayers, collectionName);
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

    async scoreToDisplay(collectionName: string): Promise<Score[]> {
        let currentScores = await this.groupedScores(collectionName);

        let sortedScores = Array.from(currentScores).sort((a: [number, string[]], b: [number, string[]]) => { return (b[0] - a[0]) });
        sortedScores.splice(5);

        let bestScores: Score[] = [];
        for (let score of sortedScores) {
            let names = score[1].join(' - ');
            bestScores.push({ name: names, scoreValue: score[0] })
        }
        return bestScores;
    }

    private async groupedScores(collectionName: string): Promise<Map<number, string[]>> {
        let scores = collectionName === DATABASE_COLLECTION_CLASSIC ? await this.getScoreboardClassic() : await this.getScoreBoardLog();
        let scoresToDisplay = new Map<number, string[]>();

        for (let score of scores) {
            let names = scoresToDisplay.get(score.scoreValue)
            if (names !== undefined) {
                names.push(score.name);
                continue;
            }
            scoresToDisplay.set(score.scoreValue, [score.name]);
        }

        return scoresToDisplay;
    }

    private async isNewScoreGreater(score: Score, collectionName: string): Promise<boolean> {
        const isInScoreboard = await this.scoreService.isPlayerInScoreboard(score.name, collectionName);

        if (isInScoreboard) {
            const playerScoreInBoard = await this.scoreService.getPlayerScore(score.name, collectionName);
            if (playerScoreInBoard > score.scoreValue) {
                return false;
            }
            this.scoreService.deleteElement(score.name, collectionName);
        }
        return true;
    }

    private async getScoreboardClassic(): Promise<Score[]> {
        return this.scoreService.getScoreboardClassic();
    }

    private async getScoreBoardLog(): Promise<Score[]> {
        return this.scoreService.getScoreboardLog();
    }
}
