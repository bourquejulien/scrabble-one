import { Board, ImmutableBoard } from '@app/classes/board/board';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { BoardError } from '@app/errors/board-error';
import { Placement, ValidationResponse } from '@common';

export class BoardHandler {
    constructor(private readonly board: Board, private readonly boardValidator: BoardValidator) {}

    lookupLetters(letters: Placement[]): ValidationResponse {
        return this.boardValidator.validate(letters);
    }

    placeLetters(letters: Placement[]): ValidationResponse {
        const response = this.boardValidator.validate(letters);

        if (!response.isSuccess) {
            return response;
        }

        this.board.merge(letters);

        return response;
    }

    retrieveNewLetters(placements: Placement[]): Placement[] {
        const newLetters: Placement[] = [];

        try {
            for (const { letter, position } of placements) {
                const square = this.board.getSquare(position);

                if (square.letter === '') {
                    newLetters.push({ letter, position });
                } else if (square.letter !== letter) {
                    return [];
                }
            }
        } catch (error) {
            if (error instanceof BoardError) return [];
            throw error;
        }

        return newLetters;
    }

    get immutableBoard(): ImmutableBoard {
        return this.board;
    }
}
