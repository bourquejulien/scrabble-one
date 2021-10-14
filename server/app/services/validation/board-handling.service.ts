import { Service } from 'typedi';
import { Board } from '@app/classes/board/board';
import { Bonus, letterDefinitions, Vec2 } from '@common';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { Config } from '@app/config';
import JsonBonuses from '@assets/bonus.json';
import { BoardHandler } from '@app/classes/board/board-handler';
import { BoardValidatorFactory } from '@app/classes/validation/board-validator-factory';

@Service()
export class BoardHandlingService {
    private readonly boardValidatorFactory: BoardValidatorFactory;

    constructor(dictionary: DictionaryService, private readonly sessionHandlingService: SessionHandlingService) {
        const letterValues = BoardHandlingService.retrieveLetterValues();
        this.boardValidatorFactory = new BoardValidatorFactory(dictionary, letterValues);
    }

    private static retrieveLetterValues(): { [key: string]: number } {
        const letterValues: { [key: string]: number } = {};

        for (const [letter, data] of letterDefinitions) {
            letterValues[letter] = data.points;
        }

        return letterValues;
    }

    private static retrieveBonuses(): [Vec2, Bonus][] {
        const bonuses: [Vec2, Bonus][] = new Array<[Vec2, Bonus]>();

        for (const jsonBonus of JsonBonuses) {
            bonuses.push([jsonBonus.Position, Bonus[jsonBonus.Bonus as keyof typeof Bonus]]);
        }

        return bonuses;
    }

    getBoardHandler(id: string): BoardHandler | null {
        const board = this.sessionHandlingService.getHandler(id)?.board;
        if (board === undefined) return null;

        return new BoardHandler(board, this.boardValidatorFactory);
    }

    generateBoard(): Board {
        return new Board(Config.GRID.GRID_SIZE, BoardHandlingService.retrieveBonuses());
    }
}
