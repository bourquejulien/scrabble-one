import { Vec2 } from '@app/classes/vec2';

class Grid {
    public readonly GRID_SIZE: number = 15;
    public readonly CANVAS_SIZE: Vec2 = { x: 700, y: 700 };
    public readonly DEFAULT_LINE_WIDTH = 3;
    public readonly STROKE_STYLE = 'black';
    public readonly DEFAULT_GRID_SIZE = 15;
    public readonly DEFAULT_BACKGROUND_COLOR = '#C6BDA6';
}

export class Constants {
    public static readonly Grid = new Grid();
}
