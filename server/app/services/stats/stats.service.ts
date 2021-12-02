import { EndGameData } from '@app/classes/end-game-data';
import { ScoreService } from '@app/services/score/score.service';
import { GameMode, Score } from '@common';
import { Service } from 'typedi';

const MAX_DOCUMENTS = 5;

@Service()
export class StatsService {
    constructor(readonly scoreService: ScoreService) {}

    async updateScoreboards(endGameData: EndGameData): Promise<void> {
        const eligiblePlayers = await this.currentGreaterScores(endGameData.scores, endGameData.gameMode);

        if (eligiblePlayers.length === 0) {
            return;
        }

        await this.scoreService.updateScoreboard(eligiblePlayers, endGameData.gameMode);
    }

    async getScoreToDisplay(gameMode: GameMode): Promise<Score[]> {
        const currentScores = await this.groupedScores(gameMode);

        const sortedScores = Array.from(currentScores).sort((a: [number, string[]], b: [number, string[]]) => {
            return b[0] - a[0];
        });
        sortedScores.splice(MAX_DOCUMENTS);

        const bestScores: Score[] = [];
        for (const score of sortedScores) {
            const names = score[1].join(' - ');
            bestScores.push({ name: names, scoreValue: score[0] });
        }
        return bestScores;
    }

    private async currentGreaterScores(scoreList: Score[], gameMode: GameMode): Promise<Score[]> {
        const listScores: Score[] = [];

        for (const score of scoreList) {
            if (await this.isNewScoreGreater(score, gameMode)) {
                listScores.push(score);
            }
        }

        return listScores;
    }

    private async groupedScores(gameMode: GameMode): Promise<Map<number, string[]>> {
        const scores = gameMode === GameMode.Classic ? await this.getScoreboardClassic() : await this.getScoreBoardLog();
        const scoresToDisplay = new Map<number, string[]>();

        for (const score of scores) {
            const names = scoresToDisplay.get(score.scoreValue);
            if (names !== undefined) {
                names.push(score.name);
                continue;
            }
            scoresToDisplay.set(score.scoreValue, [score.name]);
        }

        return scoresToDisplay;
    }

    private async isNewScoreGreater(score: Score, gameMode: GameMode): Promise<boolean> {
        const isInScoreboard = await this.scoreService.isPlayerInScoreboard(score.name, gameMode);

        if (isInScoreboard) {
            const playerScoreInBoard = await this.scoreService.getPlayerScore(score.name, gameMode);
            if (playerScoreInBoard > score.scoreValue) {
                return false;
            }
            await this.scoreService.deleteElement(score.name, gameMode);
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
