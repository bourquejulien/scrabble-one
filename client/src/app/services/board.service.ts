import { Injectable } from '@angular/core';
import { Board, ImmutableBoard } from '@app/classes/board/board';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { Bonus } from '@app/classes/board/bonus';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/constants/global.constants';
import JsonBonuses from '@assets/bonus.json';
import JsonLetters from '@assets/letters.json';
import { DictionaryService } from './dictionary.service';

@Injectable({
    providedIn: 'root',
})
export class BoardService {
    private readonly board: Board;
    private readonly boardValidator: BoardValidator;

    constructor(dictionary: DictionaryService) {
        this.board = new Board(Constants.grid.gridSize, this.retrieveBonuses());
        this.boardValidator = new BoardValidator(this.board, dictionary.lookup, this.retrieveLetterValues());
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
}
