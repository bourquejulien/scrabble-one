import { Bonus } from '@app/classes/bonus';

export interface Square {
    readonly letter: string;
    readonly bonus: Bonus;
}
