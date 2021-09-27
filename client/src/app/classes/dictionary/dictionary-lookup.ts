export interface DictionaryLookup {
    lookup(word: string): boolean;
    lookUpStart(word: string): { isWord: boolean; isOther: boolean };
    lookUpEnd(word: string): boolean;
}
