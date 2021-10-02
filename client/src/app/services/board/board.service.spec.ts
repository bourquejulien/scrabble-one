/* eslint-disable max-classes-per-file -- Need more than one stub class */
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ImmutableBoard } from '@app/classes/board/board';
import { Direction } from '@app/classes/board/direction';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Vec2 } from '@app/classes/vec2';
import { BoardService } from '@app/services/board/board.service';
import { BoardValidatorGeneratorService } from '@app/services/validation/board-validator-generator.service';

const WORD = 'pomme';
const COMBINED_WORD: { letter: string; position: Vec2 }[] = [
    { letter: 'p', position: { x: 7, y: 7 } },
    { letter: 'o', position: { x: 8, y: 7 } },
    { letter: 'm', position: { x: 9, y: 7 } },
    { letter: 'm', position: { x: 10, y: 7 } },
    { letter: 'e', position: { x: 11, y: 7 } },
];

class BoardValidatorStub {
    lastLetters: { letter: string; position: Vec2 }[] = [];
    isSuccess = false;

    validate(letters: { letter: string; position: Vec2 }[]): ValidationResponse {
        this.lastLetters = letters;
        return { isSuccess: this.isSuccess, points: 0, description: '' };
    }
    // eslint-disable-next-line no-unused-vars -- Parameter useless for stub
    getLetterPoints(letter: string): number {
        return 0;
    }
}

@Injectable({
    providedIn: 'root',
})
class BoardValidatorGeneratorServiceStub {
    readonly validator: BoardValidatorStub;

    constructor() {
        this.validator = new BoardValidatorStub();
    }

    // eslint-disable-next-line no-unused-vars -- board is useless for stub
    generator(board: ImmutableBoard): BoardValidator {
        return this.validator as unknown as BoardValidator;
    }
}

describe('BoardService', () => {
    let service: BoardService;
    let boardValidatorGeneratorServiceStub: BoardValidatorGeneratorServiceStub;
    let centerPosition: Vec2;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: BoardValidatorGeneratorService, useClass: BoardValidatorGeneratorServiceStub }],
        });
        service = TestBed.inject(BoardService);
        boardValidatorGeneratorServiceStub = TestBed.inject(BoardValidatorGeneratorService) as unknown as BoardValidatorGeneratorServiceStub;
        const halfBoardSize = Math.floor(service.gameBoard.size / 2);
        centerPosition = { x: halfBoardSize, y: halfBoardSize };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should validate letters', () => {
        service.lookupLetters(COMBINED_WORD);
        expect(boardValidatorGeneratorServiceStub.validator.lastLetters).toEqual(COMBINED_WORD);
    });

    it('should validate before placing letters', () => {
        const clonedBoard = service.gameBoard.clone();
        service.placeLetters(COMBINED_WORD);
        expect(boardValidatorGeneratorServiceStub.validator.lastLetters).toEqual(COMBINED_WORD);
        expect(clonedBoard).toEqual(service.gameBoard.clone());
    });

    it('should palace letters when validation is successful', () => {
        boardValidatorGeneratorServiceStub.validator.isSuccess = true;

        service.placeLetters(COMBINED_WORD);
        expect(boardValidatorGeneratorServiceStub.validator.lastLetters).toEqual(COMBINED_WORD);
        expect(service.gameBoard.getSquare(COMBINED_WORD[0].position).letter).toEqual(COMBINED_WORD[0].letter);
    });

    it('should retrieve only new letters', () => {
        boardValidatorGeneratorServiceStub.validator.isSuccess = true;
        const NEW_WORD = WORD + 's';

        service.placeLetters(COMBINED_WORD);
        let newLetters = service.retrieveNewLetters(NEW_WORD, centerPosition, Direction.Right);
        expect(newLetters).toEqual([{ letter: 's', position: { x: centerPosition.x + NEW_WORD.length - 1, y: centerPosition.y } }]);

        newLetters = service.retrieveNewLetters(WORD, centerPosition, Direction.Right);
        expect(newLetters).toEqual([]);
    });

    it('should not retrieve new letters on out of board', () => {
        boardValidatorGeneratorServiceStub.validator.isSuccess = true;
        service.placeLetters(COMBINED_WORD);

        let newLetters = service.retrieveNewLetters(WORD + WORD, centerPosition, Direction.Right);
        expect(newLetters).toEqual([]);

        newLetters = service.retrieveNewLetters(WORD, { x: centerPosition.x * 3, y: centerPosition.x * 3 }, Direction.Right);
        expect(newLetters).toEqual([]);
    });

    it('should resetBoard when called', () => {
        service.resetBoardService();
        expect(service.gameBoard).toBeTruthy();
    });
});
