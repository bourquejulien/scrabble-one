import { Constants } from '@app/constants/global.constants';
import { Vec2 } from '@common';
import { Board } from './board';
import { Bonus } from './bonus';
import { BoardOverflowError } from '@app/exceptions/board-overflow-error';
import { Direction } from './direction';
import { BoardMergeError } from '@app/exceptions/board-merge-error';

const BONUS: [Vec2, Bonus][] = [
    [{ x: 0, y: 0 }, Bonus.L2],
    [{ x: 1, y: 0 }, Bonus.L3],
    [{ x: 0, y: 1 }, Bonus.L3],
    [{ x: 0, y: 2 }, Bonus.W2],
    [{ x: 0, y: 3 }, Bonus.W3],
    [{ x: 0, y: 4 }, Bonus.None],
];

const SIZE = Constants.GRID.GRID_SIZE;

describe('Board', () => {
    let board: Board;

    beforeEach(() => {
        board = new Board(Constants.GRID.GRID_SIZE, BONUS);
    });

    it('should return square with bonus', () => {
        expect(board).toBeTruthy();
    });

    it('should throw on out of board', () => {
        expect(() => board.getSquare({ x: SIZE * 2, y: SIZE * 2 })).toThrow(new BoardOverflowError('Board capacity exceeded'));
    });

    it('should throw on negative position', () => {
        expect(() => board.getSquare({ x: -SIZE * 2, y: -SIZE * 2 })).toThrow(new BoardOverflowError('Position must not be negative'));
    });

    it('should return relative position', () => {
        let square = board.getRelative({ x: 0, y: 0 }, Direction.Right);
        expect(square?.bonus).toEqual(Bonus.L3);

        square = board.getRelative({ x: 0, y: 0 }, Direction.Down);
        expect(square?.bonus).toEqual(Bonus.L3);

        square = board.getRelative({ x: 0, y: 0 }, Direction.Left);
        expect(square).toBeNull();
    });

    it('should be merged', () => {
        const letters = [
            { letter: 'a', position: { x: 0, y: 0 } },
            { letter: 'a', position: { x: 1, y: 0 } },
            { letter: 'a', position: { x: 2, y: 0 } },
        ];
        board.merge(letters);

        for (const letter of letters) {
            const square = board.getSquare(letter.position);
            expect(square.letter).toEqual(letter.letter);
        }
    });

    it('should not merge on already filled squares', () => {
        const letters = [
            { letter: 'a', position: { x: 0, y: 0 } },
            { letter: 'a', position: { x: 1, y: 0 } },
            { letter: 'a', position: { x: 2, y: 0 } },
        ];
        board.merge(letters);

        expect(() => board.merge(letters)).toThrowError(BoardMergeError);
    });

    it('should be cloned', () => {
        const clonedBoard = board.clone();
        for (let x = 0; x < SIZE; x++) {
            for (let y = 0; y < SIZE; y++) {
                expect(clonedBoard.getSquare({ x, y })).toEqual(board.getSquare({ x, y }));
            }
        }
        expect(board.clone()).not.toBe(board);
    });
});
