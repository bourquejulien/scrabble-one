import { Vec2 } from '@app/classes/vec2';
import { ValidationResponse } from './validation-response';

export interface ValidationLookup {
    lookupLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse;
}
