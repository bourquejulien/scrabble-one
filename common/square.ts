import { Bonus } from './bonus';
import { Vec2 } from './vec2';

export interface Square {
    letter: string;
    bonus: Bonus;
    readonly position: Vec2;
}
