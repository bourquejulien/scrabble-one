import { Injectable } from '@angular/core';
import { ImmutableBoard } from '@app/classes/board/board';
import { letterDefinitions } from '@common/letter';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';

@Injectable({
    providedIn: 'root',
})
export class BoardValidatorGeneratorService {
    constructor(private readonly dictionary: DictionaryService) {}

    generator(board: ImmutableBoard): BoardValidator {
        return new BoardValidator(board, this.dictionary, this.retrieveLetterValues());
    }

    private retrieveLetterValues(): { [key: string]: number } {
        const letterValues: { [key: string]: number } = {};

        for (const [letter, data] of letterDefinitions) {
            letterValues[letter] = data.points;
        }

        return letterValues;
    }
}
