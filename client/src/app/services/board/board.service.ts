import { Injectable } from '@angular/core';
import { Board, ImmutableBoard } from '@app/classes/board/board';
import { Bonus } from '@app/classes/board/bonus';
import { Direction } from '@app/classes/board/direction';
import { Square } from '@app/classes/board/square';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { ValidationLookup } from '@app/classes/validation/validation-lookup';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/constants/global.constants';
import { BoardError } from '@app/exceptions/board-error';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import JsonBonuses from '@assets/bonus.json';
import JsonLetters from '@assets/letters.json';

@Injectable({
    providedIn: 'root',
})
export class BoardService implements ValidationLookup {
    private readonly board: Board;
    private readonly boardValidator: BoardValidator;

    constructor(dictionary: DictionaryService) {
        this.board = new Board(Constants.GRID.GRID_SIZE, this.retrieveBonuses());
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

        try {
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

    private retrieveLetterValues(): { [key: string]: number } {
        const letterValues: { [key: string]: number } = {};

        for (const jsonLetter of JsonLetters) {
            letterValues[jsonLetter.Letter] = jsonLetter.Value;
        }

        return letterValues;
    }
}
