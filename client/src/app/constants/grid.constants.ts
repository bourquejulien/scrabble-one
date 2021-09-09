import { Vec2 } from '@app/classes/vec2';

/* eslint-disable @typescript-eslint/no-magic-numbers -- Constant file */
export class Grid {
    readonly gridSize: number = 15;
    readonly canvasSize: Vec2 = { x: 700, y: 700 };
    readonly lineWidth: number = 3;
    readonly strokeStyle: string = 'black';
    readonly backgroundColor: string = '#C6BDA6';
}
