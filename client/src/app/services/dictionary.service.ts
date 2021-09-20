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

    constructor(private http: HttpClient) {
        this.dictionary = new Trie();
        this.retrieveDictionary();
    }

    lookup(word: string): boolean {
        return this.dictionary.contains(word);
    }

    lookUpStart(word: string): boolean {
        return this.dictionary.startsWith(word);
    }

    private retrieveDictionary(): void {
        this.http.get(Constants.dictionary.DICTIONARY_PATH).subscribe((jsonData) => {
            const jsonDictionary = jsonData as JsonDictionary;
            jsonDictionary.words.forEach((word) => this.dictionary.insert(word));
        });
    }
}
