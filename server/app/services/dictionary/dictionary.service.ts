import { DictionaryMetadata, JsonDictionary } from '@common';
import { generateId } from '@app/classes/id';
import fs from 'fs';
import { Service } from 'typedi';
import * as logger from 'winston';

@Service()
export class DictionaryService {
    dummyMetadata: DictionaryMetadata[] = [
        {
            id: '1',
            description: 'Default Dictionary',
            filepath: '/home/boss/poly/cours/LOG2990/log2990-301/server/assets/dictionary.json',
            name: 'Dictionnaire du serveur',
            nbWords: 1024,
        },
        { id: '2', description: 'Default Dictionary', filepath: '/tmp/nothere', name: 'Dictionnaire du serveur 2', nbWords: 2048 },
    ];
    dictionaryMetadata: DictionaryMetadata[];

    constructor() {
        this.dictionaryMetadata = this.dummyMetadata;
    }

    retrieveDictionary(dictionaryIndex: number): void {
        fs.readFile(this.dictionaryMetadata[dictionaryIndex].filepath, 'utf8', (_error, jsonData) => {
            // const jsonDictionary = JSON.parse(jsonData) as JsonDictionary;
        });
    }

    reset() {
        this.dictionaryMetadata = [];
        this.parse('/home/boss/poly/cours/LOG2990/log2990-301/server/assets/dictionary.json');
    }

    remove(metadata: DictionaryMetadata) {
        this.dictionaryMetadata.splice(this.dictionaryMetadata.indexOf(metadata), 1);
        fs.rm(metadata.filepath, (err) => {
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
                    name: json.title,
                    description: json.description,
                    filepath,
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
