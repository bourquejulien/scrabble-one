import { Board } from '@app/classes/board/board';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { Config } from '@app/config';
import JsonBonuses from '@assets/bonus.json';
import { Bonus, BonusInfos, LETTER_DEFINITIONS } from '@common';
import { Service } from 'typedi';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { DictionaryHandler } from '@app/handlers/dictionary/dictionary-handler';

@Service()
export class BoardGeneratorService {
    private readonly bonusCounts: Map<Bonus, number>;

    constructor() {
        this.bonusCounts = new Map<Bonus, number>([
            [Bonus.L2, 0],
            [Bonus.W2, 0],
            [Bonus.L3, 0],
            [Bonus.W3, 0],
        ]);
        for (const jsonBonus of JsonBonuses) {
            const jsonStringToEnum = Bonus[jsonBonus.Bonus as keyof typeof Bonus];
            const valueOfKey = this.bonusCounts.get(jsonStringToEnum);
            if (valueOfKey !== undefined) {
                this.bonusCounts.set(jsonStringToEnum, valueOfKey + 1);
            }
        }
    }

    private static retrieveLetterValues(): { [key: string]: number } {
        const letterValues: { [key: string]: number } = {};

        for (const [letter, data] of LETTER_DEFINITIONS) {
            letterValues[letter] = data.points;
        }

        return letterValues;
    }

    generateBoardHandler(isRandomBonus: boolean, dictionaryHandler: DictionaryHandler): BoardHandler {
        const board = new Board(Config.GRID.GRID_SIZE, this.retrieveBonuses(isRandomBonus));
        const boardValidator = new BoardValidator(board, BoardGeneratorService.retrieveLetterValues());

        return new BoardHandler(board, boardValidator, isRandomBonus, dictionaryHandler);
    }

    private retrieveBonuses(isRandomBonus: boolean): BonusInfos[] {
        let bonuses: BonusInfos[] = [];

        for (const jsonBonus of JsonBonuses) {
            const bonusInfo: BonusInfos = { bonus: jsonBonus.Bonus as Bonus, position: jsonBonus.Position };
            bonuses.push(bonusInfo);
        }
        if (isRandomBonus) {
            bonuses = this.shuffleBonuses(bonuses);
        }
        return bonuses;
    }

    private shuffleBonuses(bonusesArray: BonusInfos[]): BonusInfos[] {
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

    private initializeBonusBank() {
        const bonusBank: Bonus[] = [];
        for (const [bonusType, maxQuantity] of this.bonusCounts) {
            for (let i = 0; i < maxQuantity; i++) {
                bonusBank.push(bonusType);
            }
        }
        return bonusBank;
    }
}
