import { Placement } from '@common';

export interface ValidationFailed {
    readonly isSuccess: false;
    readonly description: string;
}

export interface ValidatedLetter {
    placement: Placement;
    isNew: boolean;
}

export interface ValidatedWord {
    score: number;
    letters: ValidatedLetter[];
}

export interface ValidationSucceeded {
    readonly isSuccess: true;
    score: number;
    placements: Placement[];
    words: ValidatedWord[];
}

export type ValidationResponse = ValidationFailed | ValidationSucceeded;
