/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-useless-constructor */
import { Board, ImmutableBoard } from '@app/classes/board/board';
import { Direction } from '@app/classes/board/direction';
import { Square } from '@app/classes/board/square';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Vec2 } from '@common';
import { Config } from '@app/config';
import { Service } from 'typedi';

@Service()
export class MockBoardService {
    private readonly board: Board;
    private readonly boardValidator: BoardValidator;

    constructor() {
        this.board = new Board(Config.GRID.GRID_SIZE);
    }

    get gameBoard(): ImmutableBoard {
        return this.board;
    }

    validateLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse {
        return this.boardValidator.validate(letters);
    }

    placeLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse {
        const response = this.boardValidator.validate(letters);

        if (!response.isSuccess) return response;

        this.board.merge(letters);

        return response;
    }

    retrieveNewLetters(word: string, initialPosition: Vec2, direction: Direction): { letter: string; position: Vec2 }[] {
        const newLetters: { letter: string; position: Vec2 }[] = [];
        let lastSquare: Square | null = this.board.getSquare(initialPosition);

        for (const letter of word) {
            if (lastSquare === null) return [];

            if (lastSquare.letter === '') {
                newLetters.push({ letter, position: lastSquare.position });
            }
            lastSquare = this.board.getRelative(lastSquare.position, direction);
        }

        return newLetters;
    }
}
