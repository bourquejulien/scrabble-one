/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-useless-constructor */
import { Injectable } from '@angular/core';
import { Board, ImmutableBoard } from '@app/classes/board/board';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { Square } from '@app/classes/board/square';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Vec2 } from '@app/classes/vec2';
import { Direction } from '@app/classes/board/direction';
import { Constants } from '@app/constants/global.constants';

@Injectable({
    providedIn: 'root',
})
export class MockBoardService {
    private readonly board: Board;
    private readonly boardValidator: BoardValidator;

    constructor() {
        this.board = new Board(Constants.GRID.GRID_SIZE);
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
