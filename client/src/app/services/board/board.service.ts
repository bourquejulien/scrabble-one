import { Injectable } from '@angular/core';
import { Board, ImmutableBoard } from '@app/classes/board/board';
import { Bonus } from '@app/classes/board/bonus';
import { Direction } from '@app/classes/board/direction';
import { Square } from '@app/classes/board/square';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { Validation } from '@app/classes/validation/validation';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/constants/global.constants';
import { BoardError } from '@app/exceptions/board-error';
import { BoardValidatorGeneratorService } from '@app/services/validation/board-validator-generator.service';
import JsonBonuses from '@assets/bonus.json';

@Injectable({
    providedIn: 'root',
})
export class BoardService implements Validation {
    mustShuffle = false;
    private board: Board;

    constructor(private readonly validatorGenerator: BoardValidatorGeneratorService) {
        this.board = new Board(Constants.GRID.GRID_SIZE, this.retrieveBonuses());
    }

    get gameBoard(): ImmutableBoard {
        return this.board;
    }

    resetBoardService(): void {
        this.board = new Board(Constants.GRID.GRID_SIZE, this.retrieveBonuses());
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
        let bonuses: [Vec2, Bonus][] = new Array<[Vec2, Bonus]>();
        for (const jsonBonus of JsonBonuses) {
            bonuses.push([jsonBonus.Position, Bonus[jsonBonus.Bonus as keyof typeof Bonus]]);
        }
        if (this.mustShuffle) {
            bonuses = this.shuffleBonuses(bonuses);
        }
        return bonuses;
    }
    private shuffleBonuses(bonusesArray: [Vec2, Bonus][]) {
        const POSSIBLE_BONUSES = [Bonus.L2, Bonus.L3, Bonus.W2, Bonus.W3];
        for (const bonus of bonusesArray) {
            if (bonus[1] !== Bonus.Star) {
                const bonusToPlace = POSSIBLE_BONUSES[Math.floor(Math.random() * POSSIBLE_BONUSES.length)];
                bonus[1] = bonusToPlace;
                const index = Constants.BONUSES_ARRAY.indexOf(bonusToPlace, 0);
                if (index > -1) {
                    Constants.BONUSES_ARRAY.splice(index, 1);
                }
            }
        }
        return bonusesArray;
    }
    private get validator(): BoardValidator {
        return this.validatorGenerator.generator(this.board);
    }
}
