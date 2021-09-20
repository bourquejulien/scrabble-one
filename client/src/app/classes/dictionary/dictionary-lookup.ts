export interface DictionaryLookup {
    lookup(word: string): boolean;
    lookUpStart(word: string): boolean;
}
