import { Score } from '@app/classes/score';
import { DatabaseService } from '@app/services/database/database.service';
import { Collection } from 'mongodb';
import { Service } from 'typedi';

const DATABASE_COLLECTION_CLASSIC = 'classicScoreboard';
const DATABASE_COLLECTION_LOG = 'logScoreboard';

@Service()
export class ScoreService {
    private classicScoreboard: Collection<Score>;
    private logScoreboard: Collection<Score>;

    constructor(private databaseService: DatabaseService) {
        this.classicScoreboard = this.databaseService.scrabbleDb.collection(DATABASE_COLLECTION_CLASSIC);
        this.logScoreboard = this.databaseService.scrabbleDb.collection(DATABASE_COLLECTION_LOG);
    }

    async updateScoreboard(score: Score, collectionName: string): Promise<void> {
        const collection = this.databaseService.scrabbleDb.collection(collectionName);
        collection.insertOne(score);
        const currentScores = await collection.find().sort({ 'score.scoreValue': -1 }).limit(5).toArray();
        const lastScore = currentScores.pop();
        collection.deleteOne({ scoreValue: lastScore?.scoreValue });

        // TO DO: Delete last from database
    }

    async isPlayerInScoreboard(playerName: string, collectionName: string): Promise<boolean> {
        const collection = this.databaseService.scrabbleDb.collection(collectionName);
        return collection.findOne({ name: playerName }) === null ? false : true;
    }

    async getPlayerNamesByScore(playerName: string, collectionName: string): Promise<string[] | undefined> {
        const collection = this.databaseService.scrabbleDb.collection(collectionName);
        return collection.findOne({ score: playerName })?.then((score) => {
            return score?.name.toArray();
        });
    }

    async getPlayerScore(playerName: string, collectionName: string): Promise<number> {
        // let collection = this.databaseService.scrabbleDb.collection(collectionName);
        return this.getCollection(collectionName)
            .findOne({ name: playerName })
            .then((score) => {
                return score!.scoreValue;
            });
    }

    private getCollection(collectionName: string): Collection<Score> {
        return collectionName === DATABASE_COLLECTION_CLASSIC ? this.classicScoreboard : this.logScoreboard;
    }

    async getScoreboardClassic(): Promise<Score[]> {
        // TO DO: MAYBE LIMIT 5??
        return this.classicScoreboard.find().toArray();
    }

    async getScoreboardLog(): Promise<Score[]> {
        return this.logScoreboard.find().toArray();
    }

    /// ///////// TO DO : IF SAME SCORE BUT DIFFERENT PEOPLE
}
