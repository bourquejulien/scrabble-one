import { Constants } from '@app/constants';
import JsonClassicBoard from '@assets/default-scoreboards/classic.json';
import JsonLogBoard from '@assets/default-scoreboards/log.json';
import { Score } from '@common';
import { Db, MongoClient } from 'mongodb';
import { Service } from 'typedi';
import logger from 'winston';

const DATABASE_URL = `${process.env.DB_URL}`;
const DATABASE_NAME = 'Scrabble';

@Service()
export class DatabaseService {
    client: MongoClient;
    scrabbleDb: Db;

    constructor() {
        this.client = new MongoClient(DATABASE_URL);
        this.scrabbleDb = this.client.db(DATABASE_NAME);
    }

    async run(): Promise<void> {
        try {
            await this.client.connect();
            await this.scrabbleDb.command({ ping: 1 });
            const countClassic = await this.scrabbleDb.collection(Constants.DATABASE_COLLECTION_CLASSIC).countDocuments();
            const countLog = await this.scrabbleDb.collection(Constants.DATABASE_COLLECTION_LOG).countDocuments();

            if (countClassic === 0) {
                this.initCollections(Constants.DATABASE_COLLECTION_CLASSIC);
            }

            if (countLog === 0) {
                this.initCollections(Constants.DATABASE_COLLECTION_LOG);
            }
        } catch (err) {
            await this.client.close();
        }
    }

    async fillClassicBoardWithDefault(): Promise<void> {
        const scoreboardClassic = this.scrabbleDb.collection<Score>(Constants.DATABASE_COLLECTION_CLASSIC);
        const options = { ordered: true };

        await scoreboardClassic.insertMany(JsonClassicBoard, options);
        logger.info('Classic scoreboard has been filled with default values.');
    }

    async fillLogBoardWithDefault(): Promise<void> {
        const scoreboardClassic = this.scrabbleDb.collection<Score>(Constants.DATABASE_COLLECTION_LOG);
        const options = { ordered: true };

        await scoreboardClassic.insertMany(JsonLogBoard, options);
        logger.info('Log scoreboard has been filled with default values.');
    }

    async reset(collectionName: string): Promise<void> {
        await this.scrabbleDb.dropCollection(collectionName);
        await this.initCollections(collectionName);
        logger.info('Scoreboard collections have been reset.');
    }

    private async initCollections(collectionName: string): Promise<void> {
        if (collectionName === Constants.DATABASE_COLLECTION_CLASSIC) {
            await this.scrabbleDb.createCollection(Constants.DATABASE_COLLECTION_CLASSIC);
            await this.fillClassicBoardWithDefault();
        } else {
            await this.scrabbleDb.createCollection(Constants.DATABASE_COLLECTION_LOG);
            await this.fillLogBoardWithDefault();
        }
    }
}
