import { Injectable } from '@angular/core';
import JsonDictionary from '@assets/dictionary.json';

@Injectable({
    providedIn: 'root',
})
export class DictionaryService {
    // TODO Replace with a trie
    private dictionary: Set<string>;
    constructor() {
        this.dictionary = this.getDictionary();
    }

    lookup(word: string): boolean {
        return this.dictionary.has(word);
    }

    private getDictionary(): Set<string> {
        const dictionary: Set<string> = new Set<string>();
        for (const word of JsonDictionary.words) {
            dictionary.add(word);
        }

        return dictionary;
    }
}
