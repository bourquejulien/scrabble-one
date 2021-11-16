import { Dictionary } from '@app/classes/dictionary/dictionary';
import { Trie } from '@app/classes/trie/trie';

export class DictionaryHandler implements Dictionary {
    private readonly dictionary: Trie;
    private readonly reverseDictionary: Trie;

    constructor(words: string[]) {
        this.dictionary = new Trie();
        this.reverseDictionary = new Trie();
        this.insertWords(words);
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
        return this.reverseDictionary.startsWith(DictionaryHandler.flipWord(word)).isOther;
    }

    insertWords(words: string[]) {
        for (const word of words) {
            this.dictionary.insert(word);
            this.reverseDictionary.insert(DictionaryHandler.flipWord(word));
        }
    }
}
