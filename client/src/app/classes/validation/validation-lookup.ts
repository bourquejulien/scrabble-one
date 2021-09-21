import { Vec2 } from '@app/classes/vec2';
import { Direction } from '@app/classes/board/direction';
import { ValidationResponse } from './validation-response';

export interface ValidationLookup {
    lookupLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse;
    retrieveNewLetters(word: string, initialPosition: Vec2, direction: Direction): { letter: string; position: Vec2 }[];
}
