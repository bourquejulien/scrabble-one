import { Vec2 } from '@common';

export interface Play {
    score: number;
    word: string;
    letters: { letter: string; position: Vec2 }[];
}
