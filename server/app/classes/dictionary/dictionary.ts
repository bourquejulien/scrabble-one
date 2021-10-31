import { WordDefinition } from '@common';

export interface Dictionary {
    lookup(word: string): boolean;
    lookUpStart(word: string): WordDefinition;
    lookUpEnd(word: string): boolean;
}
