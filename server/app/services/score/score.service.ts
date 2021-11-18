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
        this.getCollection(collectionName).insertOne(score);

        // removed the limit... not necessary in this function i think
        const sortedScores = await this.getCollection(collectionName).find().sort({ 'score.scoreValue': -1 }).toArray();
        const lastScore = sortedScores.pop();

        this.getCollection(collectionName).deleteOne({ scoreValue: lastScore?.scoreValue });
    }

    async updateNamesWithSameScore(score: Score, collectionName: string): Promise<void> {
        let playersWithSameScore = await this.getPlayerNamesByScore(score.scoreValue, collectionName);
        playersWithSameScore.push(score.name[0]);
        this.getCollection(collectionName).findOneAndUpdate({ scoreValue: score.scoreValue }, { $set: { name: playersWithSameScore } });
    }

    async isPlayerInScoreboard(playerName: string, collectionName: string): Promise<boolean> {
        return this.getCollection(collectionName).findOne({ name: playerName }) === null ? false : true;
    }

    async getPlayerNamesByScore(scoreVal: number, collectionName: string): Promise<string[]> {
        return this.getCollection(collectionName).findOne({ score: scoreVal }).then((score) => {
            return score === undefined ? [''] : score.name;
        });
    }

    async getPlayerScore(playerName: string, collectionName: string): Promise<number> {
        return this.getCollection(collectionName)
            .findOne({ name: playerName })
            .then((score) => {
                return score === undefined ? -1 : score.scoreValue;
            });
    }

    async getScoreboardClassic(): Promise<Score[]> {
        return this.classicScoreboard.find().toArray();
    }

    async getScoreboardLog(): Promise<Score[]> {
        return this.logScoreboard.find().toArray();
    }

    private getCollection(collectionName: string): Collection<Score> {
        return collectionName === DATABASE_COLLECTION_CLASSIC ? this.classicScoreboard : this.logScoreboard;
    }
}
