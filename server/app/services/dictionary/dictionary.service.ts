import { DictionaryMetadata, JsonDictionary } from '@common';
import { promises } from 'fs';
import { Service } from 'typedi';
import * as logger from 'winston';
import path from 'path';
import { Validator } from 'jsonschema';
import { Constants } from '@app/constants';

const defaultDictionary: DictionaryMetadata = {
    id: 'dictionary.json',
    description: 'Default Dictionary',
    title: 'Dictionnaire du serveur',
    nbWords: 402503,
};
const schema = {
    title: 'string',
    description: 'string',
    words: ['string'],
    required: ['title', 'description', 'words'],
};
const dictionaryPath = process.env.UPLOAD_DIR ?? process.cwd() + '/assets/';

@Service()
export class DictionaryService {
    private dictionaryMetadata: DictionaryMetadata[];

    constructor() {
        this.dictionaryMetadata = [defaultDictionary];
    }

    private static validate(data: string) {
        const validator = new Validator();
        return validator.validate(data, schema);
    }

    getFilepath(metadata: DictionaryMetadata): string {
        return path.join(dictionaryPath, metadata.id);
    }

    async getWords(metadata: DictionaryMetadata): Promise<string[]> {
        let result: string[] = [];
        const data = await promises.readFile(this.getFilepath(metadata), 'utf8');
        try {
            const json = JSON.parse(data) as JsonDictionary;
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

    reset() {
        this.dictionaryMetadata = [];
        this.parse(this.getFilepath(defaultDictionary));
    }

    remove(metadata: DictionaryMetadata) {
        const filepath = this.getFilepath(metadata);
        if (metadata !== defaultDictionary) {
            this.dictionaryMetadata.splice(this.dictionaryMetadata.indexOf(metadata), 1);
            promises
                .unlink(filepath)
                .then(() => {
                    logger.debug(`Successful Deletion: ${filepath}`);
                })
                .catch((err) => {
                    logger.error(err.stack);
                });
        } else {
            logger.error('Attempted to delete the default dictionary :o');
        }
    }

    update(metadata: DictionaryMetadata[]) {
        if (!this.dictionaryMetadata.find((m) => m === defaultDictionary) && metadata) {
            this.dictionaryMetadata = metadata;
            this.dictionaryMetadata.push(defaultDictionary);
        }
    }

    add(json: JsonDictionary, id: string): boolean {
        const metadata: DictionaryMetadata = {
            title: json.title,
            description: json.description,
            id,
            nbWords: json.words.length,
        };
        if (!this.dictionaryMetadata.find((m) => m.id === metadata.id)) {
            this.dictionaryMetadata.push(metadata);
            return true;
        }
        logger.debug('Dictionary was not added because there was a duplicate');
        return false;
    }

    async parse(filepath: string): Promise<JsonDictionary> {
        const data = await promises.readFile(filepath, 'utf8');
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

    getMetadata(id: string) {
        return this.dictionaryMetadata.find((m) => m.id === id);
    }

    get dictionaries() {
        return this.dictionaryMetadata;
    }
}
