import { Score } from '@app/classes/score';
import { Db, MongoClient } from 'mongodb';
import { Service } from "typedi";

const DATABASE_URL = `mongodb+srv:${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`;
const DATABASE_NAME = 'Scrabble';
const DATABASE_COLLECTION = 'Scoreboard';

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
            await this.fillBoardWithDefault();
        } catch {
            await this.client.close()
        }
    }

    async fillBoardWithDefault(): Promise<void> {
        const scoreboard = this.scrabbleDb.collection<Score>(DATABASE_COLLECTION);

        await scoreboard.insertMany([
            {
                name: ['Snoop'],
                scoreValue: '15'
            },
            {
                name: ['Dog'],
                scoreValue: '12'
            },
            {
                name: ['Donald'],
                scoreValue: '11'
            },
            {
                name: ['Pepe'],
                scoreValue: '10'
            },
            {
                name: ['John', 'Cena'],
                scoreValue: '8'
            }
        ]);
    }

    get database(): Db {
        return this.scrabbleDb;
    }
}
