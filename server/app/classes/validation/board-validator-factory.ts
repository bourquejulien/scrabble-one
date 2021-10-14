import { BoardValidator } from '@app/classes/validation/board-validator';
import { Dictionary } from '@app/classes/dictionary/dictionary';
import { ImmutableBoard } from '@app/classes/board/board';

export class BoardValidatorFactory {
    constructor(private readonly dictionary: Dictionary, private readonly letterPoints: { [key: string]: number }) {}

    generate(board: ImmutableBoard): BoardValidator {
        return new BoardValidator(board, this.dictionary, this.letterPoints);
    }
}
