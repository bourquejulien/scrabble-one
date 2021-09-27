import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DictionaryLookup } from '@app/classes/dictionary/dictionary-lookup';
import { JsonDictionary } from '@app/classes/dictionary/json-dictionary';
import { Trie } from '@app/classes/trie/trie';
import { Constants } from '@app/constants/global.constants';

@Injectable({
    providedIn: 'root',
})
export class DictionaryService implements DictionaryLookup {
    private readonly dictionary: Trie;
    private readonly reverseDictionary: Trie;

    constructor(private http: HttpClient) {
        this.dictionary = new Trie();
        this.reverseDictionary = new Trie();
        this.retrieveDictionary();
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
        return this.dictionary.startsWith(DictionaryService.flipWord(word)).isOther;
    }

    private retrieveDictionary(): void {
        this.http.get(Constants.dictionary.DICTIONARY_PATH).subscribe((jsonData) => {
            const jsonDictionary = jsonData as JsonDictionary;
            jsonDictionary.words.forEach((word) => this.dictionary.insert(word));
            jsonDictionary.words.forEach((word) => this.reverseDictionary.insert(DictionaryService.flipWord(word)));
        });
    }
}
