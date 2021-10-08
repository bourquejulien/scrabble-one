import { Vec2 } from '@common/vec2';
import { Direction } from '@app/classes/board/direction';
import { ValidationResponse } from './validation-response';
import { ImmutableBoard } from '@app/classes/board/board';

export interface Validation {
    lookupLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse;
    retrieveNewLetters(word: string, initialPosition: Vec2, direction: Direction): { letter: string; position: Vec2 }[];
    get gameBoard(): ImmutableBoard;
}
