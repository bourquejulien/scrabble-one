import { Square } from './square';
import { Vec2 } from './vec2';

export interface BoardData {
    board: Square[][];
    readonly filledPositions: Vec2[];
}
