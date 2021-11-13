import { Dictionary } from '@app/classes/dictionary/dictionary';
import { JsonDictionary } from '@common';
import { Trie } from '@app/classes/trie/trie';
import { Config } from '@app/config';
import fs from 'fs';
import { Service } from 'typedi';

@Service()
export class DictionaryService implements Dictionary {
    private readonly dictionary: Trie;
    private readonly reverseDictionary: Trie;

    constructor() {
        this.dictionary = new Trie();
        this.reverseDictionary = new Trie();
    }

    private static flipWord(word: string): string {
        let flippedWord = '';

        for (const char of word) {
            flippedWord = char + flippedWord;
        }

        return flippedWord;
    }

    lookup(word: string): boolean {
        return this.dictionary.contains(word);
    }

    lookUpStart(word: string): { isWord: boolean; isOther: boolean } {
        return this.dictionary.startsWith(word);
    }

    lookUpEnd(word: string): boolean {
        return this.reverseDictionary.startsWith(DictionaryService.flipWord(word)).isOther;
    }

    retrieveDictionary(): void {
        fs.readFile(Config.DICTIONARY_PATH, 'utf8', (_error, jsonData) => {
            const jsonDictionary = JSON.parse(jsonData) as JsonDictionary;
            this.insertWords(jsonDictionary.words);
        });
    }

    private insertWords(words: string[]) {
        for (const word of words) {
            this.dictionary.insert(word);
            this.reverseDictionary.insert(DictionaryService.flipWord(word));
        }
    }
}
