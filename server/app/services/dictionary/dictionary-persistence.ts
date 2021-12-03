import { Service } from 'typedi';
import { DatabaseService } from '@app/services/database/database.service';
import { DictionaryMetadata } from '@common';
import { Collection } from 'mongodb';
import path from 'path';

const COLLECTION_NAME = 'dictionary.metadata';
const DEFAULT_PATH = path.join(process.cwd(), 'assets', 'dictionaries', 'dictionary.json');

@Service()
export class DictionaryPersistence {
    defaultMetadata: DictionaryMetadata;
    private metaDataCache: Map<string, DictionaryMetadata>;

    constructor(private readonly databaseService: DatabaseService) {
        this.defaultMetadata = {
            _id: 'dictionary.json',
            path: DEFAULT_PATH,
            title: 'Dictionnaire du serveur',
            description: 'Le dictionnaire par défaut',
            nbWords: 402503,
        };

        this.metaDataCache = new Map<string, DictionaryMetadata>();
        this.metaDataCache.set(this.defaultMetadata._id, this.defaultMetadata);
    }

    async add(dictionaryMetadata: DictionaryMetadata): Promise<boolean> {
        const isDuplicate = await this.isDuplicate(dictionaryMetadata);

        if (isDuplicate || this.isDefault(dictionaryMetadata._id)) {
            return false;
        }

        const result = await this.metaDataCollection.insertOne(dictionaryMetadata);

        if (result.acknowledged) {
            this.metaDataCache.set(dictionaryMetadata._id, dictionaryMetadata);
            return true;
        }

        return false;
    }

    async remove(id: string): Promise<DictionaryMetadata | null> {
        if (this.isDefault(id)) {
            return null;
        }

        const result = await this.metaDataCollection.findOneAndDelete({ _id: id });
        this.metaDataCache.delete(id);

        return result.value;
    }

    async update(dictionaryMetadata: DictionaryMetadata): Promise<boolean> {
        const isDuplicate = await this.isDuplicate(dictionaryMetadata);

        if (isDuplicate || this.isDefault(dictionaryMetadata._id)) {
            return false;
        }

        const result = await this.metaDataCollection.findOneAndUpdate(
            { _id: dictionaryMetadata._id },
            { $set: { title: dictionaryMetadata.title, description: dictionaryMetadata.description } },
            { upsert: false },
        );

        const updatedMetadata = result.value;

        if (updatedMetadata == null) {
            return false;
        }

        this.metaDataCache.set(updatedMetadata._id, updatedMetadata);

        return true;
    }

    async getMetadata(): Promise<DictionaryMetadata[]> {
        const metaData = await this.metaDataCollection.find().sort({ title: -1 }).toArray();
        metaData.forEach((m) => this.metaDataCache.set(m._id, m));

        return Array.from(this.metaDataCache.values());
    }

    async getMetadataById(id: string): Promise<DictionaryMetadata | null> {
        const metadata = this.metaDataCache.get(id);

        if (metadata !== undefined) {
            return metadata;
        }

        return await this.metaDataCollection.findOne({ _id: id });
    }

    async reset(): Promise<void> {
        const count = await this.metaDataCollection.countDocuments();

        if (count > 0) {
            await this.metaDataCollection.drop();
        }

        this.metaDataCache.clear();
        this.metaDataCache.set(this.defaultMetadata._id, this.defaultMetadata);
    }

    private async isDuplicate(dictionaryMetadata: DictionaryMetadata): Promise<boolean> {
        for (const metadata of this.metaDataCache.values()) {
            if (metadata.title === dictionaryMetadata.title) {
                return true;
            }
        }

        const response = await this.metaDataCollection.findOne({ title: dictionaryMetadata.title });
        return response != null && response._id !== dictionaryMetadata._id;
    }

    private isDefault(id: string): boolean {
        return this.defaultMetadata._id === id;
    }

    private get metaDataCollection(): Collection<DictionaryMetadata> {
        return this.databaseService.database.collection<DictionaryMetadata>(COLLECTION_NAME);
    }
}
