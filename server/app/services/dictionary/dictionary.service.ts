import { generateId } from '@app/classes/id';
import { DictionaryHandler } from '@app/handlers/dictionary-handler/dictionary-handler';
import { DictionaryPersistence } from '@app/services/dictionary/dictionary-persistence';
import { Answer, DictionaryMetadata, JsonDictionary } from '@common';
import * as fs from 'fs';
import { Validator, ValidatorResult } from 'jsonschema';
import path from 'path';
import { Service } from 'typedi';
import * as logger from 'winston';

const schema = {
    title: 'string',
    description: 'string',
    words: ['string'],
    required: ['title', 'description', 'words'],
};

@Service()
export class DictionaryService {
    private static dictionaryPath = process.env.UPLOAD_DIR ?? process.cwd() + '/assets/dictionaries/upload/';
    private handlers: Map<string, DictionaryHandler>;

    constructor(private readonly dictionaryPersistence: DictionaryPersistence) {
        this.handlers = new Map<string, DictionaryHandler>();
    }

    static getFilepath(metadata: DictionaryMetadata): string {
        return path.join(this.dictionaryPath, metadata._id);
    }

    private static validate<T>(data: T): ValidatorResult {
        const validator = new Validator();
        return validator.validate(data, schema);
    }

    private static async parse(filepath: string): Promise<JsonDictionary> {
        const data = await fs.promises.readFile(filepath, 'utf8');
        const dictionary = JSON.parse(data) as JsonDictionary;
        logger.debug('Dictionary parsing successful');

        if (!this.validate(dictionary).valid) {
            return Promise.reject('Dictionary format invalid');
        }

        return dictionary;
    }

    private static async getWords(filepath: string): Promise<string[]> {
        let result: string[] = [];

        try {
            const data = await fs.promises.readFile(filepath, 'utf8');
            result = JSON.parse(data) as string[];
            logger.debug(`Retrieved dictionary of size ${result.length} from path ${filepath}`);
        } catch (err) {
            logger.warn(`JSON.parse returned an error ${err.stack}`);
        }
        return result;
    }

    async init(): Promise<void> {
        await this.createHandler(this.dictionaryPersistence.defaultMetadata);
        await fs.promises.mkdir(DictionaryService.dictionaryPath, { recursive: true });
    }

    async reset(): Promise<void> {
        await this.dictionaryPersistence.reset();
        this.handlers.clear();
        await fs.promises.rmdir(DictionaryService.dictionaryPath, { recursive: true });
        await fs.promises.mkdir(DictionaryService.dictionaryPath, { recursive: true });
        logger.debug('Successful Dictionary directory reset');
    }

    async add(tempPath: string): Promise<Answer<DictionaryMetadata[], string>> {
        let json;

        try {
            json = await DictionaryService.parse(tempPath);
        } catch (err) {
            return { isSuccess: false, payload: 'Le format du dictionnaire est invalide' };
        }

        const id = generateId();
        const newFilepath = path.resolve(path.join(DictionaryService.dictionaryPath, id));

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
            return { isSuccess: false, payload: `Échec de l'ajout : le dictionnaire ${metadata.title} existe déjà` };
        }

        await fs.promises.unlink(tempPath);
        await fs.promises.writeFile(newFilepath, JSON.stringify(json.words), 'utf-8');
        logger.debug(`Dictionary moved/renamed to ${newFilepath}`);

        return { isSuccess: true, payload: await this.getMetadata() };
    }

    async update(metadataList: DictionaryMetadata[]): Promise<Answer<DictionaryMetadata[]>> {
        let isSuccess = true;
        for (const metadata of metadataList) {
            isSuccess &&= await this.dictionaryPersistence.update(metadata);
        }
        return { isSuccess, payload: await this.getMetadata() };
    }

    async remove(id: string): Promise<boolean> {
        const metadata = await this.dictionaryPersistence.remove(id);

        this.handlers.delete(id);

        if (metadata != null) {
            fs.promises
                .unlink(metadata.path)
                .then(() => {
                    logger.debug(`Successful Deletion: ${metadata.path}`);
                })
                .catch((err) => {
                    logger.warn('Dictionary file cannot be deleted', err);
                });

            return true;
        }

        logger.warn('Attempted to delete the default dictionary :o');
        return false;
    }

    async getHandler(id: string): Promise<Answer<DictionaryHandler, string>> {
        let handler = this.handlers.get(id) ?? null;

        if (handler != null) {
            return { isSuccess: true, payload: handler };
        }

        const metadata = await this.dictionaryPersistence.getMetadataById(id);

        if (metadata === null) {
            return { isSuccess: false, payload: 'Le dictionnaire spécifié est introuvable' };
        }

        handler = await this.createHandler(metadata);

        if (handler == null) {
            return { isSuccess: false, payload: "Le dictionnaire n'est pas actuellement disponible" };
        }

        return { isSuccess: true, payload: handler };
    }

    async getJsonDictionary(id: string): Promise<JsonDictionary | null> {
        const metadata = await this.getMetadataById(id);

        if (metadata == null) {
            return null;
        }

        const words = await DictionaryService.getWords(metadata.path);

        return {
            title: metadata.title,
            description: metadata.description,
            words,
        };
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
            await this.dictionaryPersistence.remove(metadata._id);
            return null;
        }

        const dictionaryHandler = new DictionaryHandler(words, metadata);
        this.handlers.set(metadata._id, dictionaryHandler);

        return dictionaryHandler;
    }
}
