import { DatabaseService } from '@app/services/database/database.service';
import { Score } from '@common';
import { Collection } from 'mongodb';
import { Service } from 'typedi';

const DATABASE_COLLECTION_CLASSIC = 'classicScoreboard';
const DATABASE_COLLECTION_LOG = 'logScoreboard';
const MAX_DOCUMENTS = 25;

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
    }

    async isPlayerInScoreboard(playerName: string, collectionName: string): Promise<boolean> {
        const foundPlayer = await this.getCollection(collectionName).findOne({ name: playerName });
        return foundPlayer !== null;
    }

    async deleteElement(playerName: string, collectionName: string): Promise<void> {
        await this.getCollection(collectionName).deleteOne({ name: playerName });
    }

    async isScoreUnique(scoreVal: number, collectionName: string): Promise<boolean> {
        const scoreFound = await this.getCollection(collectionName).findOne({ scoreValue: scoreVal });
        return scoreFound === null;
    }

    async getPlayerScore(playerName: string, collectionName: string): Promise<number> {
        return this.getCollection(collectionName)
            .findOne({ name: playerName })
            .then((score) => {
                return score == null ? -1 : score.scoreValue;
            });
    }

    async getScoreboardClassic(): Promise<Score[]> {
        return this.classicScoreboard.find().limit(MAX_DOCUMENTS).sort({ scoreValue: -1 }).toArray();
    }

    async getScoreboardLog(): Promise<Score[]> {
        return this.logScoreboard.find().limit(MAX_DOCUMENTS).sort({ scoreValue: -1 }).toArray();
    }

    private getCollection(collectionName: string): Collection<Score> {
        return collectionName === DATABASE_COLLECTION_CLASSIC ? this.classicScoreboard : this.logScoreboard;
    }
}
