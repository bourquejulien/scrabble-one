// TODO validate _ for private members
/* eslint-disable no-underscore-dangle */
import { Square } from '@app/classes/square';
import { Vec2 } from './vec2';
import { BoardOverflowError } from '@app/exceptions/board-overflow-error';
import { Bonus } from './bonus';
import { BoardMergeError } from '@app/exceptions/board-merge-error';

export interface ImmutableBoard {
    readonly size: number;

    getSquare(position: Vec2): Square;
    up(position: Vec2): Square | null;
    down(position: Vec2): Square | null;
    left(position: Vec2): Square | null;
    right(position: Vec2): Square | null;
    clone(): Board;
    get filledSquare(): number;
}

export class Board implements ImmutableBoard {
    readonly size: number;
    private readonly board: Square[][];

    private _filledSquare: number = 0;

    constructor(size: number, bonuses: [Vec2, Bonus][]) {
        this.size = size;
        this.board = new Array<Square[]>();

        for (let x = 0; x <= size; x++) {
            const column: Square[] = new Array<Square>();

            for (let y = 0; y <= size; y++) {
                column.push({ letter: '', bonus: Bonus.None });
            }

            this.board.push(column);
        }

        for (const [position, bonus] of bonuses) {
            this.board[position.x][position.y] = { letter: '', bonus };
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

    up(position: Vec2): Square | null {
        this.positionGuard(position);

        const row = position.y - 1;
        if (row < 0) return null;

        return this.board[position.x][row];
    }

    down(position: Vec2): Square | null {
        this.positionGuard(position);

        const row = position.y + 1;
        if (row > this.size - 1) return null;

        return this.board[position.x][row];
    }

    left(position: Vec2): Square | null {
        this.positionGuard(position);

        const column = position.x - 1;
        if (column < 0) return null;

        return this.board[column][position.y];
    }

    right(position: Vec2): Square | null {
        this.positionGuard(position);

        const column = position.x + 1;
        if (column > this.size - 1) return null;

        return this.board[column][position.y];
    }

    clone(): Board {
        return { ...this };
    }

    get filledSquare(): number {
        return this._filledSquare;
    }

    private setLetter(letter: string, position: Vec2): void {
        const replacedSquare = this.getSquare(position);
        this.board[position.x][position.y] = { letter, bonus: replacedSquare.bonus };
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
