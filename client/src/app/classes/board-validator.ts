import { Board } from './board';
import { ValidationResponse } from './validation-response';
import { Vec2 } from './vec2';

export class BoardValidator {
    constructor(private board: Board) {}

    validateWord(letters: [string, Vec2][]): ValidationResponse {
        return { isSuccess: true, description: '', points: 1 };
    }
}
