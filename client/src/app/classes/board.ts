import { Square } from '@app/classes/square';
import { Vec2 } from './vec2';
import { BoardOverflowError } from '@app/exceptions/board-overflow-error';
import { Bonus } from './bonus';

export class Board {
    readonly size: Vec2;
    private readonly board: Square[][];

    constructor(size: Vec2, bonus: Record<string, Bonus>) {
        this.size = size;
        this.board = new Array<Square[]>();

        for (let x = 0; x <= size.x; x++) {
            const column: Square[] = new Array<Square>();

            for (let y = 0; y <= size.y; y++) {
                column.push({ letter: '', bonus: bonus[`${x.toString()}${y.toString()}`], position: { x, y } });
            }

            this.board.push(column);
        }
    }

    getSquare(position: Vec2): Square {
        this.positionGuard(position);
        return this.board[position.x][position.y];
    }

    setSquare(position: Vec2, square: Square): void {
        this.positionGuard(position);
        this.board[position.x][position.y] = square;
    }

    replaceSquare(position: Vec2, square: Square): Square {
        this.positionGuard(position);

        const replacedSquare = this.getSquare(position);
        this.setSquare(position, square);

        return replacedSquare;
    }

    up(square: Square): Square | null {
        const row = square.position.y - 1;
        if (row < 0) return null;

        return this.board[square.position.y][row];
    }

    down(square: Square): Square | null {
        const row = square.position.y + 1;
        if (row > this.size.y - 1) return null;

        return this.board[square.position.y][row];
    }

    left(square: Square): Square | null {
        const column = square.position.x - 1;
        if (column < 0) return null;

        return this.board[column][square.position.x];
    }

    right(square: Square): Square | null {
        const column = square.position.x + 1;
        if (column > this.size.x - 1) return null;

        return this.board[column][square.position.x];
    }

    private positionGuard(position: Vec2) {
        if (position.x + 1 > this.board.length || position.y + 1 > this.board[0].length) {
            throw new BoardOverflowError('Board capacity exceeded');
        }
        if (position.x < 0 || position.y < 0) {
            throw new BoardOverflowError('Position must not be negative');
        }
    }
}
