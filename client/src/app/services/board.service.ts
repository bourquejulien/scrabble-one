import { Injectable } from '@angular/core';
import { Board, ImmutableBoard } from '@app/classes/board';
import { BoardValidator } from '@app/classes/board-validator';
import { Bonus } from '@app/classes/bonus';
import { ValidationResponse } from '@app/classes/validation-response';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/constants/global.constants';
import JsonBonuses from '@assets/bonus.json';
import JsonLetters from '@assets/letters.json';

@Injectable({
    providedIn: 'root',
})
export class BoardService {
    private readonly board: Board;
    private readonly boardValidator: BoardValidator;

    constructor() {
        this.board = new Board(Constants.grid.gridSize, this.retrieveBonuses());
        this.boardValidator = new BoardValidator(this.board, this.lookup, this.retrieveLetterValues());
    }

    get gameBoard(): ImmutableBoard {
        return this.board;
    }

    validateWord(letters: [string, Vec2][]): ValidationResponse {
        return this.boardValidator.validate(letters);
    }

    addWord(letters: [string, Vec2][]): ValidationResponse {
        const response = this.boardValidator.validate(letters);

        if (!response.isSuccess) return response;

        this.board.merge(letters);

        return response;
    }

    private retrieveBonuses(): [Vec2, Bonus][] {
        const bonuses: [Vec2, Bonus][] = new Array<[Vec2, Bonus]>();

        for (const jsonBonus of JsonBonuses) {
            bonuses.push([jsonBonus.Position, Bonus[jsonBonus.Bonus as keyof typeof Bonus]]);
        }

        return bonuses;
    }

    private retrieveLetterValues(): { [key: string]: number } {
        const letterValues: { [key: string]: number } = {};

        for (const jsonLetter of JsonLetters) {
            letterValues[jsonLetter.Letter] = jsonLetter.Value;
        }

        return letterValues;
    }

    // TODO Implement dictionary service
    private lookup(word: string): boolean {
        return word === 'test';
    }
}
