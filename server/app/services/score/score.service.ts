import { Score } from "@app/classes/score";
import { DatabaseService } from "@app/services/database/database.service";
import { Collection } from "mongodb";
import { Service } from "typedi";

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

    async updateScoreboard(score: Score): Promise<void> {
        this.classicScoreboard.insertOne(score);
        this.classicScoreboard.find().sort({ 'score.scoreValue': -1 }).limit(5);
        // TO DO: Delete last from database
    }

    get scoreboardClassic(): Collection<Score> {
        return this.classicScoreboard;
    }

    get scoreboardLog(): Collection<Score> {
        return this.logScoreboard;
    }
}
