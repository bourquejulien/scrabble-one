/* eslint-disable no-unused-expressions -- To be */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Config } from '@app/config';
import { BoardMergeError } from '@app/errors/board-merge-error';
import { BoardOverflowError } from '@app/errors/board-overflow-error';
import { Bonus, BonusInfos } from '@common';
import { expect } from 'chai';
import { Board } from './board';
import { Direction } from './direction';

const BONUS: BonusInfos[] = [
    { bonus: Bonus.L2, position: { x: 0, y: 0 } },
    { bonus: Bonus.L3, position: { x: 1, y: 0 } },
    { bonus: Bonus.L3, position: { x: 0, y: 1 } },
    { bonus: Bonus.W2, position: { x: 0, y: 2 } },
    { bonus: Bonus.W3, position: { x: 0, y: 3 } },
    { bonus: Bonus.None, position: { x: 0, y: 4 } },
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
        expect(clonedBoard).not.equal(board);
    });

    it('should return cloned board data', () => {
        const boardData = board.boardData;
        for (let x = 0; x < SIZE; x++) {
            for (let y = 0; y < SIZE; y++) {
                expect(boardData.board[x][y]).equal(board.getSquare({ x, y }));
            }
        }

        // eslint-disable-next-line dot-notation -- Need to validate class data
        expect(boardData).not.equal(board['board']);
    });
});
