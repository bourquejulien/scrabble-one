import { Bonus } from './bonus';
import { Vec2 } from '@common';

export interface Square {
    readonly letter: string;
    readonly bonus: Bonus;
    readonly position: Vec2;
}
