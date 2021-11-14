import { DictionaryMetadata, JsonDictionary } from '@common';
import { generateId } from '@app/classes/id';
import fs from 'fs';
import { Service } from 'typedi';
import * as logger from 'winston';
import path from 'path';

@Service()
export class DictionaryService {
    dummyMetadata: DictionaryMetadata[] = [
        {
            id: 'dictionary.json',
            description: 'Default Dictionary',
            title: 'Dictionnaire du serveur',
            nbWords: 1024,
        },
    ];
    dictionaryMetadata: DictionaryMetadata[];

    constructor() {
        this.dictionaryMetadata = this.dummyMetadata;
    }

    getFilepath(metadata: DictionaryMetadata): string {
        const folder: string = /* process.env.DICTIONARIES_FOLDER ??*/ process.cwd() + '/assets/';
        return path.join(folder, metadata.id);
    }

    reset() {
        this.dictionaryMetadata = [];
        this.parse(this.getFilepath(this.dummyMetadata[0]));
    }

    remove(metadata: DictionaryMetadata) {
        this.dictionaryMetadata.splice(this.dictionaryMetadata.indexOf(metadata), 1);
        fs.rm(this.getFilepath(metadata), (err) => {
            if (err) {
                logger.error(`Deletion Error: ${err}`);
            }
        });
    }

    add(metadata: DictionaryMetadata) {
        this.dictionaryMetadata.push(metadata);
    }

    parse(filepath: string): boolean {
        fs.readFile(filepath, 'utf8', (_error, data) => {
            try {
                const json = JSON.parse(data) as JsonDictionary;
                const metadata: DictionaryMetadata = {
                    title: json.title,
                    description: json.description,
                    id: generateId(),
                    nbWords: json.words.length,
                };
                this.dictionaryMetadata.push(metadata);
                return true;
            } catch (err) {
                logger.error('Dictionary Casting Error');
                return false;
            }
        });
        return false;
    }

    getMetadata(id: string) {
        return this.dictionaryMetadata.find((m) => m.id === id);
    }
}
