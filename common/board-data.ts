import { Square } from './square';
import { Vec2 } from './vec2';

export interface BoardData {
    readonly board: Square[][];
    readonly filledPositions: Vec2[];
}
