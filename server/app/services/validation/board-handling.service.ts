import { Board } from '@app/classes/board/board';
import { BoardHandler } from '@app/classes/board/board-handler';
import { BoardValidatorFactory } from '@app/classes/validation/board-validator-factory';
import { Config } from '@app/config';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { SessionHandlingService } from '@app/services/session-handling.service';
import JsonBonuses from '@assets/bonus.json';
import { Bonus, BonusInfos, letterDefinitions } from '@common';
import { Service } from 'typedi';

@Service()
export class BoardHandlingService {
    static bonusNumber = new Map<Bonus, number>([
        [Bonus.L2, 0],
        [Bonus.W2, 0],
        [Bonus.L3, 0],
        [Bonus.W3, 0],
    ]);
    mustShuffle = true;
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

    private static retrieveBonuses(mustShuffle: boolean): BonusInfos[] {
        let bonuses: BonusInfos[] = [];

        for (const jsonBonus of JsonBonuses) {
            const bonusInfo: BonusInfos = { bonus: jsonBonus.Bonus as Bonus, position: jsonBonus.Position };
            bonuses.push(bonusInfo);
        }
        if (mustShuffle) {
            bonuses = this.shuffleBonuses(bonuses);
        }
        return bonuses;
    }
    private static shuffleBonuses(bonusesArray: BonusInfos[]): BonusInfos[] {
        const bonusBank: Bonus[] = this.initializeBonusBank();
        for (const bonusInfo of bonusesArray) {
            if (bonusInfo.bonus !== Bonus.Star) {
                const bonusToPlace = bonusBank[Math.floor(Math.random() * bonusBank.length)];
                bonusInfo.bonus = bonusToPlace;
                const index = bonusBank.indexOf(bonusToPlace, 0);
                if (index > -1) {
                    bonusBank.splice(index, 1);
                }
            }
        }
        return bonusesArray;
    }
    private static initializeBonusBank() {
        const bonusBank: Bonus[] = [];
        for (const jsonBonus of JsonBonuses) {
            const jsonStringToEnum = Bonus[jsonBonus.Bonus as keyof typeof Bonus];
            const valueOfKey = this.bonusNumber.get(jsonStringToEnum);
            if (valueOfKey !== undefined) {
                this.bonusNumber.set(jsonStringToEnum, valueOfKey + 1);
            }
        }
        for (const [bonusType, maxQuantity] of this.bonusNumber) {
            for (let i = 0; i < maxQuantity; i++) {
                bonusBank.push(bonusType);
            }
        }
        return bonusBank;
    }
    getBoardHandler(id: string): BoardHandler | null {
        const board = this.sessionHandlingService.getHandler(id)?.board;
        if (board === undefined) return null;

        return new BoardHandler(board, this.boardValidatorFactory);
    }

    generateBoard(): Board {
        return new Board(Config.GRID.GRID_SIZE, BoardHandlingService.retrieveBonuses(false));
    }
}
