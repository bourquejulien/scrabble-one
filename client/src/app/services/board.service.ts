import { Injectable } from '@angular/core';
import { Board, ImmutableBoard } from '@app/classes/board/board';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { DictionaryService } from './dictionary.service';
import { Square } from '@app/classes/board/square';
import { Bonus } from '@app/classes/board/bonus';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Vec2 } from '@app/classes/vec2';
import { Direction } from '@app/classes/board/direction';
import { Constants } from '@app/constants/global.constants';
import JsonBonuses from '@assets/bonus.json';
import JsonLetters from '@assets/letters.json';
import { ValidationLookup } from '@app/classes/validation/validation-lookup';

@Injectable({
    providedIn: 'root',
})
export class BoardService implements ValidationLookup {
    private readonly board: Board;
    private readonly boardValidator: BoardValidator;

    constructor(dictionary: DictionaryService) {
        this.board = new Board(Constants.grid.GRID_SIZE, this.retrieveBonuses());
        this.boardValidator = new BoardValidator(this.board, dictionary, this.retrieveLetterValues());
    }

    get gameBoard(): ImmutableBoard {
        return this.board;
    }

    lookupLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse {
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
