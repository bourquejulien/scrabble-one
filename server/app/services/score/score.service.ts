import { Score } from '@app/classes/score';
import { DatabaseService } from '@app/services/database/database.service';
import { Collection } from 'mongodb';
import { Service } from 'typedi';
import logger from 'winston';

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
        logger.info('about to check if unique score');
        // if score is unique, we want to use updateboard
        if (await this.isScoreUnique(score.scoreValue, collectionName)) {
            let isUnique = await this.isScoreUnique(score.scoreValue, collectionName);
            logger.info(`isUnique? ${isUnique}`);
            return false;
        }

        let playersWithSameScore = await this.getPlayerNamesByScore(score.scoreValue, collectionName);
        logger.info(`players with same score: ${playersWithSameScore[0]}`);
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
                return score === undefined ? -1 : score.scoreValue;
            });
    }

    // for display client-side
    async getScoreboardClassic(): Promise<Score[]> {
        return this.classicScoreboard.find().toArray();
    }

    // for display client-side
    async getScoreboardLog(): Promise<Score[]> {
        return this.logScoreboard.find().toArray();
    }

    private async isScoreUnique(scoreVal: number, collectionName: string): Promise<boolean> {
        // if find() doesnt find a matching result, returns null; so if null, then score is unique
        return this.getCollection(collectionName).findOne({ scoreValue: scoreVal }) === null;
    }

    private async getPlayerNamesByScore(scoreVal: number, collectionName: string): Promise<string[]> {
        let playerName = this.getCollection(collectionName).findOne({ score: scoreVal }).then((score) => {
            return score === undefined ? [''] : score.name;
        });

        logger.info(`playerName array: ${playerName[0]}`);

        // TO DO: Do we rlly want to return empty string if undefined? we dont want to display that tho...
        return this.getCollection(collectionName).findOne({ score: scoreVal }).then((score) => {
            return score === undefined ? [''] : score.name;
        });
    }

    private getCollection(collectionName: string): Collection<Score> {
        return collectionName === DATABASE_COLLECTION_CLASSIC ? this.classicScoreboard : this.logScoreboard;
    }
}
