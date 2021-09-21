import { Vec2 } from '@app/classes/vec2';

export interface Play {
    score: number;
    letters: { letter: string; position: Vec2 }[];
}
