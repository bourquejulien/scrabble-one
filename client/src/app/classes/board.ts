// TODO validate _ for private members
/* eslint-disable no-underscore-dangle */
import { Square } from '@app/classes/square';
import { Vec2 } from './vec2';
import { BoardOverflowError } from '@app/exceptions/board-overflow-error';
import { Bonus } from './bonus';
import { BoardMergeError } from '@app/exceptions/board-merge-error';
import { Direction } from './direction';

export interface ImmutableBoard {
    readonly size: number;

    getSquare(position: Vec2): Square;
    getRelative(position: Vec2, direction: Direction): Square | null;
    clone(): Board;
    get filledSquare(): number;
}

export class Board implements ImmutableBoard {
    readonly size: number;
    private readonly board: Square[][];

    private _filledSquare: number = 0;

    constructor(size: number, bonuses: [Vec2, Bonus][] = new Array()) {
        this.size = size;
        this.board = new Array<Square[]>();

        for (let x = 0; x <= size; x++) {
            const column: Square[] = new Array<Square>();

            for (let y = 0; y <= size; y++) {
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

    merge(letters: [string, Vec2][]): void {
        for (const [letter, position] of letters) {
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

        if (direction === Direction.Down || direction === Direction.Up) {
            row = direction === Direction.Down ? row - 1 : row + 1;
        } else if (direction === Direction.Left || direction === Direction.Right) {
            column = direction === Direction.Left ? column - 1 : column + 1;
        } else {
            return null;
        }

        if (row < 0 || column < 0 || row > this.size - 1 || column > this.size - 1) return null;

        return this.board[column][row];
    }

    clone(): Board {
        const clonedBoard = new Board(this.size);

        for (let x = 0; x <= this.size; x++) {
            for (let y = 0; y <= this.size; y++) {
                clonedBoard.board[x][y] = this.board[x][y];
            }
        }

        return clonedBoard;
    }

    get filledSquare(): number {
        return this._filledSquare;
    }

    private setLetter(letter: string, position: Vec2): void {
        const replacedSquare = this.getSquare(position);
        this.board[position.x][position.y] = { letter, bonus: replacedSquare.bonus, position };
        this._filledSquare++;
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
