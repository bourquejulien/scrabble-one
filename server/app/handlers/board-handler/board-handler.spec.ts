/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable max-classes-per-file -- Need more than one stub class */
/* eslint-disable no-unused-expressions -- Needed for chai library assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions -- Needed for chai library assertions*/
/* import { expect } from 'chai';
import { Board } from '@app/classes/board/board';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { Bonus, Placement, Vec2 } from '@common';
import { BoardHandler } from './board-handler';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { createSandbox } from 'sinon';

const BOARD_SIZE = 15;
const COMBINED_WORD: Placement[] = [
    { letter: 'p', position: { x: 7, y: 7 } },
    { letter: 'o', position: { x: 8, y: 7 } },
    { letter: 'm', position: { x: 9, y: 7 } },
    { letter: 'm', position: { x: 10, y: 7 } },
    { letter: 'e', position: { x: 11, y: 7 } },
];

class BoardValidatorStub {
    lastLetters: Placement[] = [];
    isSuccess = false;

    validate(letters: Placement[]): ValidationResponse {
        this.lastLetters = letters;
        return { isSuccess: this.isSuccess, points: 0, description: '' };
    }

    // eslint-disable-next-line no-unused-vars -- Parameter useless for stub
    getLetterPoints(letter: string): number {
        return 0;
    }
}

describe('BoardHandler', () => {
    let handler: BoardHandler;
    let boardValidatorStub: BoardValidatorStub;
    let centerPosition: Vec2;

    beforeEach(() => {
        boardValidatorStub = new BoardValidatorStub();
        handler = new BoardHandler(new Board(BOARD_SIZE), boardValidatorStub as unknown as BoardValidator, false);
        const halfBoardSize = Math.floor(handler.immutableBoard.size / 2);
        centerPosition = { x: halfBoardSize, y: halfBoardSize };
    });

    it('should be created', () => {
        expect(handler).to.be.ok;
    });

    it('should validate letters', () => {
        handler.lookupLetters(COMBINED_WORD);
        expect(boardValidatorStub.lastLetters).to.equal(COMBINED_WORD);
    });

    it('should validate before placing letters', () => {
        const clonedBoard = handler.immutableBoard.clone();
        handler.placeLetters(COMBINED_WORD);
        expect(boardValidatorStub.lastLetters).to.equal(COMBINED_WORD);
        expect(clonedBoard).to.eql(handler.immutableBoard.clone());
    });

    it('should place letters when board is successful', () => {
        boardValidatorStub.isSuccess = true;

        handler.placeLetters(COMBINED_WORD);
        expect(boardValidatorStub.lastLetters).to.equal(COMBINED_WORD);
        expect(handler.immutableBoard.getSquare(COMBINED_WORD[0].position).letter).to.equal(COMBINED_WORD[0].letter);
    });

    it('should retrieve only new letters', () => {
        boardValidatorStub.isSuccess = true;
        const placements = COMBINED_WORD.slice();
        const newPlacement = { letter: 's', position: { x: 12, y: 7 } };

        handler.placeLetters(COMBINED_WORD);
        let newLetters = handler.retrieveNewLetters(placements);
        expect(newLetters).to.eql([]);

        placements.push(newPlacement);
        newLetters = handler.retrieveNewLetters(placements);

        expect(newLetters).to.eql([newPlacement]);
    });

    it('should not retrieve new letters on out of board', () => {
        boardValidatorStub.isSuccess = true;
        handler.placeLetters(COMBINED_WORD);
        const placement = {
            letter: 's',
            position: {
                x: centerPosition.x * 3,
                y: centerPosition.x * 3,
            },
        };

        const newLetters = handler.retrieveNewLetters([placement]);
        expect(newLetters).to.eql([]);
    });

    it('should return nothing if letter is square does not fit with desired placement', () => {
        const PLACEMENT: Placement[] = [
            { letter: 'z', position: { x: 11, y: 7 } },
            { letter: 'e', position: { x: 12, y: 7 } },
        ];
        createSandbox().stub(boardValidatorStub, 'validate').returns({ isSuccess: true, points: 0, description: '' });
        handler.placeLetters(COMBINED_WORD);
        expect(handler.retrieveNewLetters(PLACEMENT)).to.eql([]);
    });

    it('should return false if the letter on square is not part of regex', () => {
        handler['wordRegex'] = /^[A-B]{1,15}$/;
        expect(handler.lookupLetters(COMBINED_WORD)).to.eql({
            isSuccess: false,
            description: "Le caractère p n'est pas accepté",
            points: 0,
        });
    });
    it('retrieve new Letters should support errors', () => {
        const stubbedBoard = new Board(BOARD_SIZE);
        createSandbox()
            .stub(stubbedBoard, 'getSquare')
            .returns({ letter: 'p', bonus: Bonus.L2, position: { x: 7, y: 7 } }).throws;
        handler = new BoardHandler(stubbedBoard, boardValidatorStub as unknown as BoardValidator, false);
        expect(handler.retrieveNewLetters(COMBINED_WORD)).to.throw;
    });
});*/
