import { DictionaryMetadata } from '@common';
import fs from 'fs';
import { Service } from 'typedi';
@Service()
export class DictionaryService {
    dictionaryMetadata: DictionaryMetadata[];

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

    constructor() {
        this.dictionaryMetadata = this.dummyMetadata;
    }

    retrieveDictionary(dictionaryIndex: number): void {
        fs.readFile(this.dictionaryMetadata[dictionaryIndex].filepath, 'utf8', (_error, jsonData) => {
            // const jsonDictionary = JSON.parse(jsonData) as JsonDictionary;
        });
    }

    remove() {
        // this.dictionaryMetadata.
    }

    add(metadata: DictionaryMetadata) {
        this.dictionaryMetadata.push(metadata);
    }
    /* parse(filepath: string): boolean {
        // fs.readFile(filepath, 'utf8', (_error, data) => {

        // });
        return false;
    } */
    get(id: string) {
        return this.dictionaryMetadata.find((m) => m.id === id);
    }
}
