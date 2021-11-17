import { Db, MongoClient } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';

const DATABASE_URL = `mongodb+srv:${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`;
const DATABASE_NAME = 'Scrabble';
const DATABASE_COLLECTION = 'Scoreboard';

@Service()
export class DatabaseService {
    private db: Db;
    private client: MongoClient;

    // private options: MongoClientOptions = {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    //   };
    async closeConnection(): Promise<void> {
        return this.client.close();
    }
    get database(): Db {
        return this.db;
    }
}
