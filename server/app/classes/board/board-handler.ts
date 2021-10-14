import { Board, ImmutableBoard } from '@app/classes/board/board';
import { Placement, ValidationResponse } from '@common';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { BoardValidatorFactory } from '@app/classes/validation/board-validator-factory';
import { BoardError } from '@app/errors/board-error';

export class BoardHandler {
    private readonly boardValidator: BoardValidator;
    constructor(private readonly board: Board, private readonly boardValidatorFactory: BoardValidatorFactory) {
        this.boardValidator = this.boardValidatorFactory.generate(board);
    }

    lookupLetters(letters: Placement[]): ValidationResponse {
        return this.boardValidator.validate(letters);
    }

    placeLetters(letters: Placement[]): ValidationResponse {
        const response = this.boardValidator.validate(letters);

        if (!response.isSuccess) return response;

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
