import { Vec2 } from '@common';
import { Direction } from '@app/classes/board/direction';
import { ValidationResponse } from './validation-response';

export interface Validation {
    lookupLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse;
    retrieveNewLetters(word: string, initialPosition: Vec2, direction: Direction): { letter: string; position: Vec2 }[];
}
