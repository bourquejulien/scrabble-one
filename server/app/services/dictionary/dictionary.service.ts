import { DictionaryMetadata, JsonDictionary } from '@common';
import { generateId } from '@app/classes/id';
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
const dictionaryPath = /* process.env.DICTIONARIES_FOLDER ??*/ process.cwd() + '/assets/';

@Service()
export class DictionaryService {
    private dictionaryMetadata: DictionaryMetadata[];

    constructor() {
        this.dictionaryMetadata = [defaultDictionary];
    }

    getFilepath(metadata: DictionaryMetadata): string {
        return path.join(dictionaryPath, metadata.id);
    }

    async getWords(metadata: DictionaryMetadata): Promise<string[]> {
        let result: string[] = [];
        await promises
            .readFile(this.getFilepath(metadata), 'utf8')
            .then((data) => {
                let json: JsonDictionary;
                try {
                    json = JSON.parse(data) as JsonDictionary;
                    result = json.words;
                    logger.debug(`Parsed words ${result.length} in the dictionary`);
                } catch (err) {
                    logger.error(`JSON.parse returned an error ${err.stack}`);
                }
            })
            .catch((err) => {
                logger.error(`${err.stack}`);
            });
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
                .rm(filepath)
                .then(() => {
                    logger.debug(`Successful Deletion: ${filepath}`);
                })
                .catch((err) => {
                    logger.error(err.stack);
                });
        } else {
            logger.error('Attempted to delete the default dictionary-handler :o');
        }
    }

    update(metadata: DictionaryMetadata[]) {
        if (!this.dictionaryMetadata.find((m) => m === defaultDictionary) && metadata) {
            this.dictionaryMetadata = metadata;
            this.dictionaryMetadata.push(defaultDictionary);
        }
    }

    add(metadata: DictionaryMetadata) {
        this.cleanDuplicates();
        this.dictionaryMetadata.push(metadata);
    }

    cleanDuplicates() {
        // TODO:
    }

    async parse(filepath: string): Promise<boolean> {
        const data = await promises.readFile(filepath, 'utf8');
        if (this.validate(data)) {
            let json: JsonDictionary;
            try {
                json = JSON.parse(data) as JsonDictionary;
                const metadata: DictionaryMetadata = {
                    title: json.title,
                    description: json.description,
                    id: generateId(),
                    nbWords: json.words.length,
                };
                this.dictionaryMetadata.push(metadata);
                return true;
            } catch (err) {
                logger.debug('JSON.parse() cant parse the content of that dictionary');
            }
            logger.debug('Dictionary parsing successful');
        }
        return false;
    }

    validate(data: string) {
        const validator = new Validator();
        return validator.validate(data, schema);
    }

    getMetadata(id: string) {
        return this.dictionaryMetadata.find((m) => m.id === id);
    }

    get dictionaries() {
        return this.dictionaryMetadata;
    }
}
