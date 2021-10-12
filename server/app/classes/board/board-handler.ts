import { Board } from '@app/classes/board/board';
import { Square, Vec2 } from '@common';
import { Direction } from '@app/classes/board/direction';
import { Validation } from '@app/classes/validation/validation';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { BoardError } from '@app/errors/board-error';
import { BoardValidatorFactory } from '@app/classes/validation/board-validator-factory';
import { BoardValidator } from '@app/classes/validation/board-validator';

export class BoardHandler implements Validation {
    private readonly boardValidator: BoardValidator;

    constructor(private readonly board: Board, private readonly boardValidatorFactory: BoardValidatorFactory) {
        this.boardValidator = this.boardValidatorFactory.generate(board);
    }

    lookupLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse {
        return this.boardValidator.validate(letters);
    }

    placeLetters(id: string, letters: { letter: string; position: Vec2 }[]): ValidationResponse {
        const response = this.boardValidator.validate(letters);

        if (!response.isSuccess) return response;

        this.board.merge(letters);

        return response;
    }

    retrieveNewLetters(word: string, initialPosition: Vec2, direction: Direction): { letter: string; position: Vec2 }[] {
        const newLetters: { letter: string; position: Vec2 }[] = [];

        try {
            let lastSquare: Square | null = this.board.getSquare(initialPosition);
            for (const letter of word) {
                if (lastSquare === null) return [];

                if (lastSquare.letter === '') {
                    newLetters.push({ letter, position: lastSquare.position });
                }
                lastSquare = this.board.getRelative(lastSquare.position, direction);
            }
        } catch (error) {
            if (error instanceof BoardError) return [];
            throw error;
        }

        return newLetters;
    }
}
