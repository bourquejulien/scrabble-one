import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dictionary } from '@app/classes/dictionary';
import { Constants } from '@app/constants/global.constants';

@Injectable({
    providedIn: 'root',
})
export class DictionaryService {
    // TODO Replace with a trie
    private dictionary: Set<string>;

    constructor(private http: HttpClient) {
        this.dictionary = new Set<string>();
        this.retrieveDictionary();
    }

    lookup(word: string): boolean {
        return this.dictionary.has(word);
    }

    private retrieveDictionary(): void {
        this.http.get(Constants.dictionary.DICTIONARY_PATH).subscribe((jsonData) => {
            const jsonDictionary = jsonData as Dictionary;
            jsonDictionary.words.forEach((word) => this.dictionary.add(word));
        });
    }
}
