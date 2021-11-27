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

const dictionaryPath = process.env.UPLOAD_DIR ?? process.cwd() + '/out/assets/';

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

        if (DictionaryService.validate(data)) {
            try {
                logger.debug('Dictionary parsing successful');
                return JSON.parse(data) as JsonDictionary;
            } catch (err) {
                const errorMessage = 'JSON.parse() cant parse the content of that dictionary';
                logger.error(errorMessage);
                return Promise.reject(errorMessage);
            }
        }
        return Promise.reject('Dictionary format invalid');
    }

    async init(): Promise<void> {
        await this.createHandler(this.dictionaryPersistence.defaultMetadata);

        if (!fs.existsSync(dictionaryPath)) {
            await fs.promises.mkdir(dictionaryPath, { recursive: true });
        }
    }

    async getWords(metadata: DictionaryMetadata): Promise<string[]> {
        let result: string[] = [];
        const data = await fs.promises.readFile(metadata.path, 'utf8');
        let json: JsonDictionary;
        try {
            json = JSON.parse(data) as JsonDictionary;
            result = json.words;
            logger.debug(`Parsed words ${result.length} in the dictionary`);
        } catch (err) {
            logger.error(`JSON.parse returned an error ${err.stack}`);
        }
        if (result.length < Constants.MIN_DICTIONARY_SIZE) {
            throw new Error('Not enough words in the chosen dictionary');
        }
        return result;
    }

    async reset(): Promise<void> {
        await this.dictionaryPersistence.reset();
        await DictionaryService.parse(this.dictionaryPersistence.defaultMetadata.path);
    }

    async add(tempPath: string): Promise<boolean> {
        const id = md5(path.basename(tempPath));
        const json = await DictionaryService.parse(tempPath);
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

    async remove(metadata: DictionaryMetadata): Promise<void> {
        const canRemove = await this.dictionaryPersistence.remove(metadata._id);
        if (canRemove) {
            fs.promises
                .rm(metadata.path)
                .then(() => {
                    logger.debug(`Successful Deletion: ${metadata.path}`);
                })
                .catch((err) => {
                    logger.error(err.stack);
                });
        } else {
            logger.error('Attempted to delete the default dictionary :o');
        }
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
        const words: string[] = await this.getWords(metadata);
        const dictionaryHandler = new DictionaryHandler(words, metadata);
        this.handlers.set(metadata._id, dictionaryHandler);

        return dictionaryHandler;
    }
}
