/* eslint-disable no-unused-expressions -- To be */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { Config } from '@app/config';
import { Vec2 } from '@common/vec2';
import { Board } from './board';
import { Bonus } from './bonus';
import { BoardOverflowError } from '@app/errors/board-overflow-error';
import { Direction } from './direction';
import { BoardMergeError } from '@app/errors/board-merge-error';

const BONUS: [Vec2, Bonus][] = [
    [{ x: 0, y: 0 }, Bonus.L2],
    [{ x: 1, y: 0 }, Bonus.L3],
    [{ x: 0, y: 1 }, Bonus.L3],
    [{ x: 0, y: 2 }, Bonus.W2],
    [{ x: 0, y: 3 }, Bonus.W3],
    [{ x: 0, y: 4 }, Bonus.None],
];

const SIZE = Config.GRID.GRID_SIZE;

describe('Board', () => {
    let board: Board;

    beforeEach(() => {
        board = new Board(Config.GRID.GRID_SIZE, BONUS);
    });

    it('should return square with bonus', () => {
        expect(board).to.be.ok;
    });

    it('should throw on out of board', () => {
        expect(() => board.getSquare({ x: SIZE * 2, y: SIZE * 2 })).to.throw(BoardOverflowError);
    });

    it('should throw on negative position', () => {
        expect(() => board.getSquare({ x: -SIZE * 2, y: -SIZE * 2 })).to.throw(BoardOverflowError);
    });

    it('should return relative position', () => {
        let square = board.getRelative({ x: 0, y: 0 }, Direction.Right);
        expect(square?.bonus).equal(Bonus.L3);

        square = board.getRelative({ x: 0, y: 0 }, Direction.Down);
        expect(square?.bonus).equal(Bonus.L3);

        square = board.getRelative({ x: 0, y: 0 }, Direction.Left);
        expect(square).equal(null);
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
            expect(square.letter).equal(letter.letter);
        }
    });

    it('should not merge on already filled squares', () => {
        const letters = [
            { letter: 'a', position: { x: 0, y: 0 } },
            { letter: 'a', position: { x: 1, y: 0 } },
            { letter: 'a', position: { x: 2, y: 0 } },
        ];
        board.merge(letters);

        expect(() => board.merge(letters)).to.Throw(BoardMergeError);
    });

    it('should be cloned', () => {
        const clonedBoard = board.clone();
        for (let x = 0; x < SIZE; x++) {
            for (let y = 0; y < SIZE; y++) {
                expect(clonedBoard.getSquare({ x, y })).equal(board.getSquare({ x, y }));
            }
        }
        expect(board.clone()).not.equal(board);
    });
});
