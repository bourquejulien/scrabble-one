import { DatabaseService } from '@app/services/database/database.service';
import { Score } from '@common';
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

    async updateNamesWithSameScore(score: Score, collectionName: string): Promise<boolean> {
        // if score is unique, we want to use updateboard
        if (await this.isScoreUnique(score.scoreValue, collectionName)) {
            return false;
        }

        const playersWithSameScore = await this.getPlayerNamesByScore(score.scoreValue, collectionName);
        playersWithSameScore.push(score.name[0]);
        this.getCollection(collectionName).findOneAndUpdate({ scoreValue: score.scoreValue }, { $set: { name: playersWithSameScore } });

        return true;
    }

    async isPlayerInScoreboard(playerName: string, collectionName: string): Promise<boolean> {
        return this.getCollection(collectionName).findOne({ name: playerName }) === null ? false : true;
    }

    async getPlayerScore(playerName: string, collectionName: string): Promise<number> {
        return this.getCollection(collectionName)
            .findOne({ name: playerName })
            .then((score) => {
                return score === null ? -1 : score.scoreValue;
            });
    }

    // for display client-side
    async getScoreboardClassic(): Promise<Score[]> {
        return (await this.classicScoreboard.find().sort({ scoreValue: -1 }).toArray());
    }

    // for display client-side
    async getScoreboardLog(): Promise<Score[]> {
        return this.logScoreboard.find().sort({ scoreValue: -1 }).toArray();
    }

    private async isScoreUnique(scoreVal: number, collectionName: string): Promise<boolean> {
        // if find() doesnt find a matching result, returns null; so if null, then score is unique
        return this.getCollection(collectionName).findOne({ scoreValue: scoreVal }) === null;
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
