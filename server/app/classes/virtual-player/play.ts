import { Placement } from '@common';
import { ValidatedWord } from '@app/classes/validation/validation-response';

export interface Play {
    readonly isSuccess: true;
    score: number;
    placements: Placement[];
    words: ValidatedWord[];
}
