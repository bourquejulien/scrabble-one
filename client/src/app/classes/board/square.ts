import { Bonus } from './bonus';
import { Vec2 } from '@app/classes/vec2';

export interface Square {
    readonly letter: string;
    readonly bonus: Bonus;
    readonly position: Vec2;
}
