import { Injectable } from '@angular/core';
import { Board, IBoard } from '@app/classes/board';
import { BoardValidator } from '@app/classes/board-validator';
import { Bonus } from '@app/classes/bonus';
import { ValidationResponse } from '@app/classes/validation-response';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/constants/global.constants';
import JsonBonuses from '@assets/bonus.json';

@Injectable({
    providedIn: 'root',
})
export class BoardService {
    private readonly board: Board;
    private readonly boardValidator: BoardValidator;

    constructor() {
        this.board = new Board(Constants.grid.gridSize, this.retrieveBonuses());
        this.boardValidator = new BoardValidator(this.board);
    }

    get gameBoard(): IBoard {
        return this.board;
    }

    validateWord(letters: [string, Vec2][]): ValidationResponse {
        return this.boardValidator.validateWord(letters);
    }

    addWord(letters: [string, Vec2][]): ValidationResponse {
        const response = this.boardValidator.validateWord(letters);

        if (!response.isSuccess) return response;

        this.board.merge(letters);

        return response;
    }

    private retrieveBonuses(): { [key: string]: Bonus } {
        const bonuses: { [key: string]: Bonus } = {};

        for (const jsonBonus of JsonBonuses) {
            bonuses[jsonBonus.x + jsonBonus.y] = Bonus[jsonBonus.bonus as keyof typeof Bonus];
        }

        return bonuses;
    }
}
