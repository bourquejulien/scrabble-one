import { DictionaryMetadata, JsonDictionary } from '@common';
import { Service } from 'typedi';
import * as logger from 'winston';
import path from 'path';
import { Validator } from 'jsonschema';
import { Constants } from '@app/constants';
import { DictionaryHandler } from '@app/handlers/dictionary-handler/dictionary-handler';
import { DictionaryPersistence } from '@app/services/dictionary/dictionary-persistence';
import md5 from 'md5';
import * as fs from 'fs';

const schema = {
    title: 'string',
    description: 'string',
    words: ['string'],
    required: ['title', 'description', 'words'],
};

const dictionaryPath = process.env.UPLOAD_DIR ?? process.cwd() + '/assets/dictionaries/upload/';

@Service()
export class DictionaryService {
    private handlers: Map<string, DictionaryHandler>;

    constructor(private readonly dictionaryPersistence: DictionaryPersistence) {
        this.handlers = new Map<string, DictionaryHandler>();
    }

    static getFilepath(metadata: DictionaryMetadata): string {
        return path.join(dictionaryPath, metadata._id);
    }

    private static validate(data: string) {
        const validator = new Validator();
        return validator.validate(data, schema);
    }

    private static async parse(filepath: string): Promise<JsonDictionary> {
        const data = await fs.promises.readFile(filepath, 'utf8');
        let dictionary: JsonDictionary;

        if (!DictionaryService.validate(data)) {
            return Promise.reject('Dictionary format invalid');
        }

        try {
            dictionary = JSON.parse(data) as JsonDictionary;
            logger.debug('Dictionary parsing successful');
        } catch (err) {
            const errorMessage = 'JSON.parse() cant parse the content of that dictionary';
            logger.error(errorMessage);
            return Promise.reject(errorMessage);
        }

        if (dictionary.words.length < Constants.MIN_DICTIONARY_SIZE) {
            throw new Error('Not enough words in the chosen dictionary');
        }

        return dictionary;
    }

    private static async getWords(filepath: string): Promise<string[]> {
        let result: string[] = [];
        let json: JsonDictionary;

        try {
            const data = await fs.promises.readFile(filepath, 'utf8');
            json = JSON.parse(data) as JsonDictionary;
            result = json.words;
            logger.debug(`Parsed words ${result.length} in the dictionary`);
        } catch (err) {
            logger.warn(`JSON.parse returned an error ${err.stack}`);
        }
        return result;
    }

    async init(): Promise<void> {
        await this.createHandler(this.dictionaryPersistence.defaultMetadata);

        if (!fs.existsSync(dictionaryPath)) {
            await fs.promises.mkdir(dictionaryPath, { recursive: true });
        }
    }

    async reset(): Promise<void> {
        await this.dictionaryPersistence.reset();
        await DictionaryService.parse(this.dictionaryPersistence.defaultMetadata.path);
    }

    async add(tempPath: string): Promise<boolean> {
        const json = await DictionaryService.parse(tempPath);
        const id = md5(json.title);
        const newFilepath = path.resolve(path.join(dictionaryPath, id));

        const metadata: DictionaryMetadata = {
            title: json.title,
            path: newFilepath,
            description: json.description,
            _id: id,
            nbWords: json.words.length,
        };

        const isAdded = await this.dictionaryPersistence.add(metadata);

        if (!isAdded) {
            logger.debug('Dictionary was not added because there was a duplicate');
            return false;
        }

        await fs.promises.rename(tempPath, newFilepath);
        logger.debug(`Dictionary moved/renamed to ${newFilepath}`);

        return true;
    }

    update(metadata: DictionaryMetadata[]) {
        // TODO
        // if (!this.dictionaryMetadata.find((m) => m === defaultDictionary) && metadata) {
        //     this.dictionaryMetadata = metadata;
        //     this.dictionaryMetadata.push(defaultDictionary);
        // }
    }

    async remove(id: string): Promise<boolean> {
        const metadata = await this.dictionaryPersistence.getMetadataById(id);
        const canRemove = await this.dictionaryPersistence.remove(id);

        if (canRemove && metadata != null) {
            fs.promises
                .rm(metadata.path)
                .then(() => {
                    logger.debug(`Successful Deletion: ${metadata.path}`);
                })
                .catch((err) => {
                    logger.error(err.stack);
                });

            return true;
        }

        logger.warn('Attempted to delete the default dictionary :o');
        return false;
    }

    async getHandler(id: string): Promise<DictionaryHandler | null> {
        const handler = this.handlers.get(id);

        if (handler !== undefined) {
            return handler;
        }

        const metadata = await this.dictionaryPersistence.getMetadataById(id);

        if (metadata === null) {
            return null;
        }

        return await this.createHandler(metadata);
    }

    async getMetadataById(id: string): Promise<DictionaryMetadata | null> {
        return this.dictionaryPersistence.getMetadataById(id);
    }

    async getMetadata(): Promise<DictionaryMetadata[]> {
        return this.dictionaryPersistence.getMetadata();
    }

    private async createHandler(metadata: DictionaryMetadata): Promise<DictionaryHandler | null> {
        const words: string[] = await DictionaryService.getWords(metadata.path);

        if (words.length === 0) {
            logger.warn(`Cannot find dictionary ${metadata._id}`);
            this.dictionaryPersistence.remove(metadata._id);
            return null;
        }

        const dictionaryHandler = new DictionaryHandler(words, metadata);
        this.handlers.set(metadata._id, dictionaryHandler);

        return dictionaryHandler;
    }
}
