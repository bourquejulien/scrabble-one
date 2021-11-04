import { WordDefinition } from './word-definition';

export interface Dictionary {
    lookup(word: string): boolean;
    lookUpStart(word: string): WordDefinition;
    lookUpEnd(word: string): boolean;
}
