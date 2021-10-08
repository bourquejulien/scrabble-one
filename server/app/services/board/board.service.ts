import { Service } from 'typedi';
import { Board, ImmutableBoard } from '@app/classes/board/board';
import { Bonus } from '@app/classes/board/bonus';
import { Direction } from '@app/classes/board/direction';
import { Square } from '@app/classes/board/square';
import { Validation } from '@app/classes/validation/validation';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Vec2 } from '@common/vec2';
import { Config } from '@app/config';
import { BoardError } from '@app/errors/board-error';
import JsonBonuses from '@assets/bonus.json';
import { BoardValidatorGeneratorService } from '@app/services/validation/board-validator-generator.service';
import { BoardValidator } from '@app/classes/validation/board-validator';

@Service()
export class BoardService implements Validation {
    private board: Board;

    constructor(private readonly validatorGenerator: BoardValidatorGeneratorService) {
        this.board = new Board(Config.GRID.GRID_SIZE, this.retrieveBonuses());
    }

    get gameBoard(): ImmutableBoard {
        return this.board;
    }

    resetBoardService(): void {
        this.board = new Board(Config.GRID.GRID_SIZE, this.retrieveBonuses());
    }

    lookupLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse {
        return this.validator.validate(letters);
    }

    placeLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse {
        const response = this.validator.validate(letters);

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

    private retrieveBonuses(): [Vec2, Bonus][] {
        const bonuses: [Vec2, Bonus][] = new Array<[Vec2, Bonus]>();

        for (const jsonBonus of JsonBonuses) {
            bonuses.push([jsonBonus.Position, Bonus[jsonBonus.Bonus as keyof typeof Bonus]]);
        }

        return bonuses;
    }

    private get validator(): BoardValidator {
        return this.validatorGenerator.generator(this.board);
    }
}
