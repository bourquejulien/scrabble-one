import { Board } from '@app/classes/board/board';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { Config } from '@app/config';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import JsonBonuses from '@assets/bonus.json';
import { Bonus, BonusInfos, LETTER_DEFINITIONS } from '@common';
import { Service } from 'typedi';

@Service()
export class BoardGeneratorService {
    static bonusNumber: Map<Bonus, number>;

    constructor(private readonly dictionaryService: DictionaryService) {}

    private static retrieveLetterValues(): { [key: string]: number } {
        const letterValues: { [key: string]: number } = {};

        for (const [letter, data] of LETTER_DEFINITIONS) {
            letterValues[letter] = data.points;
        }

        return letterValues;
    }

    private static retrieveBonuses(isRandomBonus: boolean): BonusInfos[] {
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

    generateBoard(isRandomBonus: boolean): Board {
        return new Board(Config.GRID.GRID_SIZE, BoardGeneratorService.retrieveBonuses(isRandomBonus));
    }

    generateBoardValidator(board: Board): BoardValidator {
        return new BoardValidator(board, this.dictionaryService, BoardGeneratorService.retrieveLetterValues());
    }
}
