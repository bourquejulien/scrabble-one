import { DatabaseService } from '@app/services/database/database.service';
import { GameMode, Score } from '@common';
import { Collection } from 'mongodb';
import { Service } from 'typedi';
import logger from 'winston';
import JsonClassicBoard from '@assets/default-scoreboards/classic.json';
import JsonLogBoard from '@assets/default-scoreboards/log.json';

const MAX_DOCUMENTS = 25;

const DATABASE_COLLECTION_CLASSIC = 'classicScoreboard';
const DATABASE_COLLECTION_LOG = 'logScoreboard';

@Service()
export class ScoreService {
    private readonly classicScoreboard: Collection<Score>;
    private readonly logScoreboard: Collection<Score>;

    constructor(private databaseService: DatabaseService) {
        this.classicScoreboard = this.databaseService.scrabbleDb.collection(DATABASE_COLLECTION_CLASSIC);
        this.logScoreboard = this.databaseService.scrabbleDb.collection(DATABASE_COLLECTION_LOG);
    }

    async init(): Promise<void> {
        const countClassic = await this.classicScoreboard.countDocuments();
        const countLog = await this.logScoreboard.countDocuments();

        if (countClassic === 0) {
            await this.fillClassicBoardWithDefault();
        }

        if (countLog === 0) {
            await this.fillLogBoardWithDefault();
        }
    }

    async updateScoreboard(score: Score[], gameMode: GameMode): Promise<void> {
        await this.getCollection(gameMode).insertMany(score);
    }

    async isPlayerInScoreboard(playerName: string, gameMode: GameMode): Promise<boolean> {
        const foundPlayer = await this.getCollection(gameMode).findOne({ name: playerName });
        return foundPlayer !== null;
    }

    async deleteElement(playerName: string, gameMode: GameMode): Promise<void> {
        await this.getCollection(gameMode).deleteOne({ name: playerName });
    }

    async getPlayerScore(playerName: string, gameMode: GameMode): Promise<number> {
        return this.getCollection(gameMode)
            .findOne({ name: playerName })
            .then((score) => {
                return score == null ? -1 : score.scoreValue;
            });
    }

    async reset(): Promise<void> {
        await this.classicScoreboard.drop();
        await this.fillClassicBoardWithDefault();

        await this.logScoreboard.drop();
        await this.fillLogBoardWithDefault();

        logger.info('Scoreboard collections have been reset.');
    }

    async getScoreboardClassic(): Promise<Score[]> {
        return this.classicScoreboard.find().limit(MAX_DOCUMENTS).sort({ scoreValue: -1 }).toArray();
    }

    async getScoreboardLog(): Promise<Score[]> {
        return this.logScoreboard.find().limit(MAX_DOCUMENTS).sort({ scoreValue: -1 }).toArray();
    }

    private getCollection(gameMode: GameMode): Collection<Score> {
        return gameMode === GameMode.Classic ? this.classicScoreboard : this.logScoreboard;
    }

    private async fillClassicBoardWithDefault(): Promise<void> {
        const options = { ordered: true };

        await this.classicScoreboard.insertMany(JsonClassicBoard, options);
        logger.info('Classic scoreboard has been filled with default values.');
    }

    private async fillLogBoardWithDefault(): Promise<void> {
        const options = { ordered: true };

        await this.logScoreboard.insertMany(JsonLogBoard, options);
        logger.info('Log scoreboard has been filled with default values.');
    }
}
