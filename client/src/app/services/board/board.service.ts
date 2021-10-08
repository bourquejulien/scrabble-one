import { Injectable } from '@angular/core';
import { Board, ImmutableBoard } from '@app/classes/board/board';
import { Bonus, BonusInfos } from '@app/classes/board/bonus';
import { Direction } from '@app/classes/board/direction';
import { Square } from '@app/classes/board/square';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { Validation } from '@app/classes/validation/validation';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/constants/global.constants';
import { BoardError } from '@app/exceptions/board-error';
import { BoardValidatorGeneratorService } from '@app/services/validation/board-validator-generator.service';
import JsonBonuses from '@assets/bonus.json';

@Injectable({
    providedIn: 'root',
})
export class BoardService implements Validation {
    bonusNumber = new Map<Bonus, number>([
        [Bonus.L2, 0],
        [Bonus.W2, 0],
        [Bonus.L3, 0],
        [Bonus.W3, 0],
    ]);
    mustShuffle = true;
    private board: Board;

    constructor(private readonly validatorGenerator: BoardValidatorGeneratorService) {
        this.board = new Board(Constants.GRID.GRID_SIZE, this.retrieveBonuses());
    }

    get gameBoard(): ImmutableBoard {
        return this.board;
    }

    resetBoardService(): void {
        this.board = new Board(Constants.GRID.GRID_SIZE, this.retrieveBonuses());
    }

    lookupLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse {
        return this.validator.validate(letters);
    }

    placeLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse {
        const response = this.validator.validate(letters);

        if (!response.isSuccess) return response;

        this.board.merge(letters);

        return response;
    }
    retrieveNewLetters(word: string, initialPosition: Vec2, direction: Direction): { letter: string; position: Vec2 }[] {
        const newLetters: { letter: string; position: Vec2 }[] = [];

        try {
            let lastSquare: Square | null = this.board.getSquare(initialPosition);
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

    private retrieveBonuses(): BonusInfos[] {
        let bonuses: BonusInfos[] = [];
        for (const jsonBonus of JsonBonuses) {
            const bonusInfo: BonusInfos = { bonus: jsonBonus.Bonus as Bonus, position: jsonBonus.Position };
            bonuses.push(bonusInfo);
        }
        if (this.mustShuffle) {
            bonuses = this.shuffleBonuses(bonuses);
        }
        return bonuses;
    }
    private shuffleBonuses(bonusesArray: BonusInfos[]) {
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
    private get validator(): BoardValidator {
        return this.validatorGenerator.generator(this.board);
    }
}
