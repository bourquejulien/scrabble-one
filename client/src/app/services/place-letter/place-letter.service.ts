import { Injectable } from '@angular/core';
import { BoardService } from '@app/services/board/board.service';
import { GridService } from '@app/services/grid/grid.service';
import { PlayerService } from '@app/services/player/player.service';
import { RackService } from '@app/services/rack/rack.service';
import { Direction, Vec2 } from '@common';
// TODO add to constant file
const MAX_SIZE = 15;
const MIN_SIZE = 1;

@Injectable({
    providedIn: 'root',
})
export class PlaceLetterService {
    tempRack: string[];
    myRack: string[];
    gridPosition: Vec2;
    positionInit: Vec2;
    isHorizontal: boolean = true;
    isLastSquare: boolean;

    constructor(
        readonly gridService: GridService,
        readonly rackService: RackService,
        readonly boardService: BoardService,
        readonly playerService: PlayerService,
    ) {
        this.tempRack = [];
        this.myRack = [];
    }

    enterOperation(): void {
        let word = '';
        let direction: Direction;
        if (this.isHorizontal) {
            direction = Direction.Right;
        } else direction = Direction.Down;
        for (const letter of this.tempRack) {
            word += letter;
        }
        this.playerService.placeLetters(word, { x: this.positionInit.x - 1, y: this.positionInit.y - 1 }, direction);
        this.myRack = [];
        this.tempRack = [];
    }

    backSpaceOperation(tempContext: CanvasRenderingContext2D): void {
        this.gridService.clearSquare(tempContext, this.gridPosition);
        if (this.isHorizontal) {
            this.gridService.cleanInsideSquare(tempContext, { x: this.gridPosition.x - 1, y: this.gridPosition.y });
        } else this.gridService.cleanInsideSquare(tempContext, { x: this.gridPosition.x, y: this.gridPosition.y - 1 });

        this.rackService.rack.push(this.myRack[this.myRack.length - 1]);
        this.tempRack.pop();
        this.myRack.pop();
        this.nextAvailableSquare(false);
        this.gridService.drawSelectionSquare(tempContext, this.gridPosition);
        this.gridService.drawDirectionArrow(tempContext, this.gridPosition, this.isHorizontal);
    }

    escapeOperation(tempContext: CanvasRenderingContext2D): void {
        this.gridService.resetCanvas(tempContext);
        this.cancel();
        this.isHorizontal = true;
        this.gridPosition = this.positionInit;
    }

    isPositionInit(position: Vec2): boolean {
        if (position.x === this.positionInit.x && position.y === this.positionInit.y) {
            return true;
        } else return false;
    }

    backSpaceEnable(key: string, squareSelected: boolean): boolean {
        if (key === 'Backspace' && squareSelected) {
            return true;
        } else {
            return false;
        }
    }

    samePosition(position: Vec2) {
        if (this.gridPosition.x === position.x && this.gridPosition.y === position.y) {
            this.isHorizontal = false;
        } else {
            this.cancel();
            this.myRack = [];
            this.gridPosition = position;
            this.positionInit = { x: position.x, y: position.y };
            this.isHorizontal = true;
        }
    }

    inGrid(position: Vec2): boolean {
        if (position.x >= MIN_SIZE && position.x <= MAX_SIZE) {
            if (position.y >= MIN_SIZE && position.y <= MAX_SIZE) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    nextAvailableSquare(isForward: boolean): void {
        if (isForward) {
            do {
                if (!this.boardService.positionIsAvailable(this.gridPosition)) {
                    this.tempRack.push(this.boardService.getLetter(this.gridPosition));
                }
                if (this.gridPosition.x === MAX_SIZE) {
                    this.isLastSquare = true;
                }
                if (this.isHorizontal && this.gridPosition.x < MAX_SIZE) {
                    this.gridPosition.x += 1;
                } else if (!this.isHorizontal && this.gridPosition.y < MAX_SIZE) {
                    this.gridPosition.y += 1;
                }
            } while (!this.boardService.positionIsAvailable(this.gridPosition));
        } else {
            do {
                if (!this.boardService.positionIsAvailable(this.gridPosition)) {
                    this.tempRack.pop();
                }
                if (this.isHorizontal && this.gridPosition.x > MIN_SIZE) {
                    this.gridPosition.x -= 1;
                } else if (!this.isHorizontal && this.gridPosition.y > MIN_SIZE) {
                    this.gridPosition.y -= 1;
                }
            } while (!this.boardService.positionIsAvailable(this.gridPosition));
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
