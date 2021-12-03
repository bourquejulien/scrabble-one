import { Injectable } from '@angular/core';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';
import { CommandsService } from '@app/services/commands/commands.service';
import { GridService } from '@app/services/grid/grid.service';
import { RackService } from '@app/services/rack/rack.service';
import { Vec2 } from '@common';

@Injectable({
    providedIn: 'root',
})
export class PlaceLetterService {
    tempRack: string[];
    myRack: string[];
    gridPosition: Vec2;
    positionInit: Vec2;
    isHorizontal: boolean;
    isLastSquare: boolean;

    constructor(
        private readonly gridService: GridService,
        private readonly rackService: RackService,
        private readonly boardService: BoardService,
        private readonly commandService: CommandsService,
    ) {
        this.isHorizontal = true;
        this.tempRack = [];
        this.myRack = [];
    }

    placeLetters(): void {
        const word = this.tempRack.join('');
        const x = this.positionInit.x;
        const y = String.fromCharCode(Constants.CHAR_OFFSET + this.positionInit.y - 1);

        const command = `!placer ${y}${x}${this.isHorizontal ? 'h' : 'v'} ${word}`;
        this.commandService.parseInput(command);

        this.myRack = [];
        this.tempRack = [];
    }

    backSpaceOperation(tempContext: CanvasRenderingContext2D): void {
        if (this.gridPosition.x > Constants.GRID.GRID_SIZE) {
            this.gridPosition.x = 16;
        }
        if (this.gridPosition.y > Constants.GRID.GRID_SIZE) {
            this.gridPosition.y = 16;
        }
        this.gridService.clearSquare(tempContext, this.gridPosition);

        if (this.isHorizontal) {
            this.gridService.cleanInsideSquare(tempContext, { x: this.gridPosition.x - 1, y: this.gridPosition.y });
        } else {
            this.gridService.cleanInsideSquare(tempContext, { x: this.gridPosition.x, y: this.gridPosition.y - 1 });
        }

        this.rackService.rack.push(this.myRack[this.myRack.length - 1]);
        this.tempRack.pop();
        this.myRack.pop();
        this.nextAvailableSquare(false);
        this.gridService.drawSelectionSquare(tempContext, this.gridPosition);
        if (this.gridPosition.x < Constants.GRID.GRID_SIZE && this.gridPosition.y < Constants.GRID.GRID_SIZE) {
            this.gridService.drawDirectionArrow(tempContext, this.gridPosition, this.isHorizontal);
        }
    }

    escapeOperation(tempContext: CanvasRenderingContext2D): void {
        this.gridService.resetCanvas(tempContext);
        this.cancel();
        this.isHorizontal = true;
        this.gridPosition = this.positionInit;
    }

    isPositionInit(position: Vec2): boolean {
        return position.x === this.positionInit.x && position.y === this.positionInit.y;
    }

    backSpaceEnable(key: string, squareSelected: boolean): boolean {
        return key === 'Backspace' && squareSelected;
    }

    isSameSquare(position: Vec2): void {
        if (this.gridPosition.x === position.x && this.gridPosition.y === position.y) {
            this.isHorizontal = !this.isHorizontal;

            return;
        }

        this.cancel();
        this.myRack = [];
        this.gridPosition = position;
        this.positionInit = { x: position.x, y: position.y };
        this.isHorizontal = true;
    }

    inGrid(position: Vec2): boolean {
        if (position.x >= 1 && position.x <= Constants.GRID.GRID_SIZE + 1) {
            return position.y >= 1 && position.y <= Constants.GRID.GRID_SIZE + 1;
        }

        return false;
    }

    nextAvailableSquare(isForward: boolean): void {
        if (isForward) {
            do {
                this.getNextSquare();
            } while (!this.boardService.isPositionAvailable(this.gridPosition));
        } else {
            do {
                this.getPastSquare();
            } while (!this.boardService.isPositionAvailable(this.gridPosition));
        }
    }

    private getNextSquare(): void {
        if (!this.boardService.isPositionAvailable(this.gridPosition)) {
            this.tempRack.push(this.boardService.getLetter(this.gridPosition));
        }

        if (this.gridPosition.x === Constants.GRID.GRID_SIZE) {
            this.isLastSquare = true;
        }

        if (this.isHorizontal && this.gridPosition.x <= Constants.GRID.GRID_SIZE + 1) {
            this.gridPosition.x += 1;
        }
        if (!this.isHorizontal && this.gridPosition.y < Constants.GRID.GRID_SIZE + 1) {
            this.gridPosition = { x: this.gridPosition.x, y: this.gridPosition.y + 1 };
        }
    }

    private getPastSquare(): void {
        if (!this.boardService.isPositionAvailable(this.gridPosition)) {
            this.tempRack.pop();
        }
        if (this.isHorizontal && this.gridPosition.x > 1) {
            this.gridPosition.x -= 1;
        }
        if (!this.isHorizontal && this.gridPosition.y > 1) {
            this.gridPosition.y -= 1;
        }
    }

    private cancel(): void {
        for (let i = this.myRack.length - 1; i >= 0; i--) {
            this.rackService.rack.push(this.myRack[i]);
            this.myRack.pop();
        }
        this.tempRack = [];
    }
}
