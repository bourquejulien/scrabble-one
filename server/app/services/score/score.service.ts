import { DatabaseService } from '@app/services/database/database.service';
import { GameMode, Score } from '@common';
import { Collection } from 'mongodb';
import { Service } from 'typedi';

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

    async getScoreboardClassic(): Promise<Score[]> {
        return this.classicScoreboard.find().limit(MAX_DOCUMENTS).sort({ scoreValue: -1 }).toArray();
    }

    async getScoreboardLog(): Promise<Score[]> {
        return this.logScoreboard.find().limit(MAX_DOCUMENTS).sort({ scoreValue: -1 }).toArray();
    }

    private getCollection(gameMode: GameMode): Collection<Score> {
        return gameMode === GameMode.Classic ? this.classicScoreboard : this.logScoreboard;
    }
}
