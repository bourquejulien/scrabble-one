import { Square } from './square';
import { Vec2 } from '@common/vec2';
import { BoardOverflowError } from '@app/exceptions/board-overflow-error';
import { Bonus } from './bonus';
import { BoardMergeError } from '@app/exceptions/board-merge-error';
import { Direction } from './direction';

export interface ImmutableBoard {
    readonly size: number;

    getSquare(position: Vec2): Square;
    getRelative(position: Vec2, direction: Direction): Square | null;
    clone(): Board;
    get center(): Vec2;
    get positions(): Vec2[];
}

export class Board implements ImmutableBoard {
    readonly size: number;
    private board: Square[][];
    private readonly filledPositions: Vec2[];

    constructor(size: number, bonuses: [Vec2, Bonus][] = []) {
        this.size = size;
        this.board = new Array<Square[]>();
        this.filledPositions = [];

        for (let x = 0; x < size; x++) {
            const column: Square[] = new Array<Square>();

            for (let y = 0; y < size; y++) {
                column.push({ letter: '', bonus: Bonus.None, position: { x, y } });
            }

            this.board.push(column);
        }

        for (const [position, bonus] of bonuses) {
            this.board[position.x][position.y] = { letter: '', bonus, position };
        }
    }

    getSquare(position: Vec2): Square {
        this.positionGuard(position);
        return this.board[position.x][position.y];
    }

    merge(letters: { letter: string; position: Vec2 }[]): void {
        for (const { letter, position } of letters) {
            this.positionGuard(position);

            if (this.board[position.x][position.y].letter !== '') {
                throw new BoardMergeError(`Letter is already set at position (${position.x},${position.y})`);
            }

            this.setLetter(letter, position);
        }
    }

    getRelative(position: Vec2, direction: Direction): Square | null {
        this.positionGuard(position);

        let row = position.y;
        let column = position.x;

        switch (direction) {
            case Direction.Down:
                row += 1;
                break;
            case Direction.Up:
                row -= 1;
                break;
            case Direction.Right:
                column += 1;
                break;
            case Direction.Left:
                column -= 1;
                break;
            default:
                break;
        }

        if (row < 0 || column < 0 || row > this.size - 1 || column > this.size - 1) return null;

        return this.board[column][row];
    }

    clone(): Board {
        const clonedBoard = new Board(this.size);

        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                clonedBoard.board[x][y] = this.board[x][y];
            }
        }

        this.filledPositions.forEach((p) => clonedBoard.filledPositions.push(p));

        return clonedBoard;
    }

    get center(): Vec2 {
        const x = Math.floor(this.board.length / 2);
        const y = Math.floor(this.board[0].length / 2);
        return { x, y };
    }

    get positions(): Vec2[] {
        return Array.from(this.filledPositions);
    }

    private setLetter(letter: string, position: Vec2): void {
        const replacedSquare = this.getSquare(position);
        this.board[position.x][position.y] = { letter, bonus: replacedSquare.bonus, position };
        this.filledPositions.push(position);
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
