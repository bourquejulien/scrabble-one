import { DatabaseService } from '@app/services/database/database.service';
import { Score } from '@common';
import { Collection } from 'mongodb';
import { Service } from 'typedi';

const DATABASE_COLLECTION_CLASSIC = 'classicScoreboard';
const DATABASE_COLLECTION_LOG = 'logScoreboard';
const MAX_DOCUMENTS = 5;

@Service()
export class ScoreService {
    private classicScoreboard: Collection<Score>;
    private logScoreboard: Collection<Score>;

    constructor(private databaseService: DatabaseService) {
        this.classicScoreboard = this.databaseService.scrabbleDb.collection(DATABASE_COLLECTION_CLASSIC);
        this.logScoreboard = this.databaseService.scrabbleDb.collection(DATABASE_COLLECTION_LOG);
    }

    async updateScoreboard(score: Score[], collectionName: string): Promise<void> {
        this.getCollection(collectionName).insertMany(score);
        const sortedScores = await this.getCollection(collectionName).find().sort({ scoreValue: -1 }).toArray();

        while ((await this.getCollection(collectionName).countDocuments()) > MAX_DOCUMENTS) {
            const lastScore = sortedScores.pop();
            this.getCollection(collectionName).deleteOne({ scoreValue: lastScore?.scoreValue });
        }
    }

    async updateNamesWithSameScore(score: Score, collectionName: string): Promise<boolean> {
        if (await this.isScoreUnique(score.scoreValue, collectionName)) {
            return false;
        }

        const playersWithSameScore = await this.getPlayerNamesByScore(score.scoreValue, collectionName);
        playersWithSameScore.push(...score.name);
        await this.getCollection(collectionName).findOneAndUpdate({ scoreValue: score.scoreValue }, { $set: { name: playersWithSameScore } });

        return true;
    }

    async isPlayerInScoreboard(playerName: string, collectionName: string): Promise<boolean> {
        const foundPlayer = await this.getCollection(collectionName).findOne({ name: playerName });
        return foundPlayer === null ? false : true;
    }

    async deleteElement(score: Score, collectionName: string): Promise<void> {
        await this.getCollection(collectionName).deleteOne({ name: score.name });
    }

    async getPlayerScore(playerName: string, collectionName: string): Promise<number> {
        return this.getCollection(collectionName)
            .findOne({ name: playerName })
            .then((score) => {
                return score === null ? -1 : score.scoreValue;
            });
    }

    async getScoreboardClassic(): Promise<Score[]> {
        return this.classicScoreboard.find().sort({ scoreValue: -1 }).toArray();
    }

    async getScoreboardLog(): Promise<Score[]> {
        return this.logScoreboard.find().sort({ scoreValue: -1 }).toArray();
    }

    private async isScoreUnique(scoreVal: number, collectionName: string): Promise<boolean> {
        const scoreFound = await this.getCollection(collectionName).findOne({ scoreValue: scoreVal });
        return scoreFound === null;
    }

    private async getPlayerNamesByScore(scoreVal: number, collectionName: string): Promise<string[]> {
        return this.getCollection(collectionName)
            .findOne({ scoreValue: scoreVal })
            .then((score) => {
                return score === null ? [''] : score.name;
            });
    }

    private getCollection(collectionName: string): Collection<Score> {
        return collectionName === DATABASE_COLLECTION_CLASSIC ? this.classicScoreboard : this.logScoreboard;
    }
}
