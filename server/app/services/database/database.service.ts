import { Score } from '@common';
import { Db, MongoClient } from 'mongodb';
import { Service } from 'typedi';
import logger from 'winston';

const DATABASE_URL = `${process.env.DB_URL}`;
const DATABASE_NAME = 'Scrabble';
const DATABASE_COLLECTION_CLASSIC = 'classicScoreboard';
const DATABASE_COLLECTION_LOG = 'logScoreboard';

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
            const countClassic = await this.scrabbleDb.collection(DATABASE_COLLECTION_CLASSIC).countDocuments();
            const countLog = await this.scrabbleDb.collection(DATABASE_COLLECTION_LOG).countDocuments();

            if (!countClassic) {
                await this.scrabbleDb.createCollection(DATABASE_COLLECTION_CLASSIC);
                await this.fillClassicBoardWithDefault();
            }
            if (!countLog) {
                await this.scrabbleDb.createCollection(DATABASE_COLLECTION_LOG);
                await this.fillLogBoardWithDefault();
            }
        } catch (e) {
            await this.client.close();
            throw e;
        }
    }

    async fillClassicBoardWithDefault(): Promise<void> {
        const scoreboardClassic = this.scrabbleDb.collection<Score>(DATABASE_COLLECTION_CLASSIC);
        const options = { ordered: true };

        await scoreboardClassic.insertMany(
            [
                {
                    name: ['Snoop'],
                    scoreValue: 15,
                },
                {
                    name: ['Dog'],
                    scoreValue: 12,
                },
                {
                    name: ['Donald'],
                    scoreValue: 11,
                },
                {
                    name: ['Pepe'],
                    scoreValue: 10,
                },
                {
                    name: ['John', 'Cena'],
                    scoreValue: 8,
                },
            ],
            options,
        );
        logger.info('Classic scoreboard has been filled with default values.');
    }

    async fillLogBoardWithDefault(): Promise<void> {
        const scoreboardClassic = this.scrabbleDb.collection<Score>(DATABASE_COLLECTION_LOG);
        const options = { ordered: true };

        await scoreboardClassic.insertMany(
            [
                {
                    name: ['Monty'],
                    scoreValue: 20,
                },
                {
                    name: ['Python'],
                    scoreValue: 17,
                },
                {
                    name: ['Satoru'],
                    scoreValue: 16,
                },
                {
                    name: ['Gojo'],
                    scoreValue: 15,
                },
                {
                    name: ['Nick', 'Jonas'],
                    scoreValue: 13,
                },
            ],
            options,
        );
        logger.info('Log scoreboard has been filled with default values.');
    }

    get database(): Db {
        return this.scrabbleDb;
    }
}
