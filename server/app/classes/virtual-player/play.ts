import { Placement } from '@common';

export interface Play {
    score: number;
    word: string;
    letters: Placement[];
}
