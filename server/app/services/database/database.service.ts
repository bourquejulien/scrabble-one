import { Db, MongoClient } from 'mongodb';
import { Service } from 'typedi';

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
        } catch (e) {
            await this.client.close();
            throw e;
        }
    }

    get database(): Db {
        return this.scrabbleDb;
    }
}
