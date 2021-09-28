import { Bonus } from '@app/classes/board/bonus';
import { FontFace } from '@app/classes/font-face';
import { Vec2 } from '@app/classes/vec2';

/* eslint-disable @typescript-eslint/no-magic-numbers -- Constants file */
/* eslint-disable @typescript-eslint/naming-convention -- Constants file */
export class Grid {
    readonly GRID_SIZE: number = 15;
    readonly CANVAS_SIZE: Vec2 = { x: 700, y: 700 };
    readonly LINE_WIDTH: number = 3;
    readonly STROKE_STYLE: string = 'black';
    readonly FONT_FACE: FontFace = { font: 'BenchNine', size: 30 };
    readonly FONT_FACE_SCALE_FACTOR: number = 0.75;
    readonly TEXT_STYLE: string = 'black';
    readonly BONUS_COLORS = new Map([
        [Bonus.None, '#C6BDA6'],
        [Bonus.L2, '#9ea6ff'],
        [Bonus.L3, '#6571ff'],
        [Bonus.W2, '#ffcccb'],
        [Bonus.W3, '#ff7d7a'],
        [Bonus.Star, '#ffcccb'],
    ]);
}
