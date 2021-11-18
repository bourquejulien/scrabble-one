import { Board, ImmutableBoard } from '@app/classes/board/board';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { BoardError } from '@app/errors/board-error';
import { Placement } from '@common';
import { DictionaryHandler } from '@app/handlers/dictionary-handler/dictionary-handler';

export class BoardHandler {
    private wordRegex: RegExp;

    constructor(
        private board: Board,
        private boardValidator: BoardValidator,
        readonly isRandomBonus: boolean,
        public dictionaryHandler: DictionaryHandler,
    ) {
        this.wordRegex = /^[A-zÀ-ú]{1,15}$/;
    }

    // Source: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript by Lewis Diamond on 05/29/16
    private static removeAccents(word: string): string {
        return word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    }

    lookupLetters(letters: Placement[]): ValidationResponse {
        for (const square of letters) {
            square.letter = BoardHandler.removeAccents(square.letter);
            if (!this.wordRegex.test(square.letter)) {
                return { isSuccess: false, description: `Le caractère ${square.letter} n'est pas accepté` };
            }
        }

        return this.boardValidator.validate(letters);
    }

    placeLetters(letters: Placement[]): ValidationResponse {
        const response = this.lookupLetters(letters);

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
