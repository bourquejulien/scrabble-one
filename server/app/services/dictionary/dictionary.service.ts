import { DictionaryMetadata, JsonDictionary } from '@common';
import { generateId } from '@app/classes/id';
import fs from 'fs';
import { Service } from 'typedi';
import * as logger from 'winston';
import path from 'path';
import { Validator } from 'jsonschema';

const defaultDictionary: DictionaryMetadata = {
    id: 'dictionary.json',
    description: 'Default Dictionary',
    title: 'Dictionnaire du serveur',
    nbWords: 1024,
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

    getWords(metadata: DictionaryMetadata): string[] {
        let result: string[] = [];
        fs.readFile(this.getFilepath(metadata), 'utf8', (_error, data) => {
            let json: JsonDictionary;
            try {
                json = JSON.parse(data) as JsonDictionary;
                result = json.words;
                logger.debug('Parsed words in the dictionary');
            } catch (SyntaxError) {
                logger.debug('JSON.parse returned an error;');
            }
        });
        return result;
    }

    reset() {
        this.dictionaryMetadata = [];
        this.parse(this.getFilepath(defaultDictionary));
    }

    remove(metadata: DictionaryMetadata) {
        if (metadata !== defaultDictionary) {
            this.dictionaryMetadata.splice(this.dictionaryMetadata.indexOf(metadata), 1);
            fs.rm(this.getFilepath(metadata), (err) => {
                if (err) {
                    logger.error(`Deletion Error: ${err}`);
                }
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

    add(metadata: DictionaryMetadata) {
        this.cleanDuplicates();
        this.dictionaryMetadata.push(metadata);
    }

    cleanDuplicates() {
        // TODO:
    }

    parse(filepath: string): boolean {
        let result = false;
        fs.readFile(filepath, 'utf8', (_error, data) => {
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
                    result = true;
                } catch (SyntaxError) {
                    logger.debug('JSON.parse returned an error;');
                }
                logger.debug('Dictionary parsing successful');
            }
            logger.debug('Dictionary parsing unsuccessful');
        });
        return result;
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
