import { Vec2 } from '@common/vec2';

export interface Play {
    score: number;
    word: string;
    letters: { letter: string; position: Vec2 }[];
}
