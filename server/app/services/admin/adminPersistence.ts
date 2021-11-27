import { Service } from 'typedi';
import { VirtualPlayerLevel } from '@common';
import { DatabaseService } from '@app/services/database/database.service';
import { Collection } from 'mongodb';
import logger from 'winston';

interface PlayerName {
    _id: string;
    level: VirtualPlayerLevel;
    isReadonly: boolean;
}

const COLLECTION_NAME = 'virtualplayers';

const DEFAULT_VIRTUAL_PLAYER_NAMES: PlayerName[] = [
    { _id: 'Monique', level: VirtualPlayerLevel.Easy, isReadonly: true },
    { _id: 'Claudette', level: VirtualPlayerLevel.Easy, isReadonly: true },
    { _id: 'Alphonse', level: VirtualPlayerLevel.Easy, isReadonly: true },
    { _id: 'Éléanor', level: VirtualPlayerLevel.Expert, isReadonly: true },
    { _id: 'Alfred', level: VirtualPlayerLevel.Expert, isReadonly: true },
    { _id: 'Jeaninne', level: VirtualPlayerLevel.Expert, isReadonly: true },
];

@Service()
export class AdminPersistence {
    constructor(private readonly databaseService: DatabaseService) {}

    async init(): Promise<void> {
        const count = await this.collection.countDocuments();

        if (count === 0) {
            await this.reset();
        }
    }

    async getPlayerNameByLevel(level: VirtualPlayerLevel): Promise<string[]> {
        const cursor = await this.collection.find({ level });
        return (await cursor.toArray()).map((p) => p._id);
    }

    async addVirtualPlayer(level: VirtualPlayerLevel, name: string): Promise<boolean> {
        try {
            await this.collection.insertOne({ _id: name, level, isReadonly: false });
        } catch (err) {
            logger.warn(`Cannot add duplicated name ${name}`);
            return false;
        }

        return true;
    }

    async deleteVirtualPlayer(name: string): Promise<VirtualPlayerLevel | null> {
        const deletedName = await this.collection.findOneAndDelete({ _id: name, isReadonly: false });
        return deletedName.value?.level ?? null;
    }

    async renameVirtualPlayer(oldName: string, newName: string): Promise<VirtualPlayerLevel | null> {
        const oldPlayer = await this.collection.findOne({ _id: oldName, isReadonly: false });

        if (oldPlayer == null) {
            logger.warn(`Cannot rename VirtualPlayer - oldName: ${oldName} does not exist`);
            return null;
        }

        const isAdded = await this.addVirtualPlayer(oldPlayer.level, newName);

        if (!isAdded) {
            logger.warn(`Cannot rename VirtualPlayer - newName: ${newName} does not exist`);
            return null;
        }

        return await this.deleteVirtualPlayer(oldName);
    }

    async reset(): Promise<void> {
        await this.collection.deleteMany({});
        await this.collection.insertMany(DEFAULT_VIRTUAL_PLAYER_NAMES);
    }

    private get collection(): Collection<PlayerName> {
        return this.databaseService.database.collection(COLLECTION_NAME);
    }
}
