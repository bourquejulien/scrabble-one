import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/constants/global.constants';

@Injectable({
    providedIn: 'root',
})
export class GridService {
    gridContext: CanvasRenderingContext2D;
    private canvasSize: Vec2 = Constants.grid.canvasSize;
    private playGridSize: number = Constants.grid.gridSize;
    private boardGridSize: number = Constants.grid.gridSize + 1;

    drawGrid() {
        this.fillSquares(Constants.grid.backgroundColor, { x: 1, y: 1 }, { x: Constants.grid.gridSize, y: Constants.grid.gridSize });

        this.gridContext.beginPath();
        this.gridContext.strokeStyle = Constants.grid.strokeStyle;
        this.gridContext.lineWidth = Constants.grid.lineWidth;

        for (let i = 1; i < this.playGridSize + 1; i++) {
            this.drawSymbol(i.toString(), { x: i, y: 0 });
            this.drawSymbol(String.fromCharCode('A'.charCodeAt(0) + i - 1), { x: 0, y: i });
        }

        for (let i = 1; i < this.boardGridSize + 1; i++) {
            this.drawRow(i);
        }

        for (let i = 1; i < this.boardGridSize + 1; i++) {
            this.drawColumn(i);
        }

        this.gridContext.stroke();
    }

    drawSymbol(letter: string, gridPosition: Vec2) {
        if (letter.length === 0 || letter.length > 2) return;

        const canvasPosition: Vec2 = this.computeCanvasCoord(gridPosition);

        // TODO Improve text scaling
        this.gridContext.fillStyle = 'black';
        this.gridContext.font = '35px system-ui';
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(letter, canvasPosition.x, canvasPosition.y);
    }

    private drawRow(pos: number) {
        const height: number = ((this.height - this.gridContext.lineWidth) * pos) / this.boardGridSize + this.gridContext.lineWidth / 2;
        this.gridContext.moveTo(this.width / this.boardGridSize + this.gridContext.lineWidth / 2, height);
        this.gridContext.lineTo(this.width + this.gridContext.lineWidth / 2, height);
    }

    private drawColumn(pos: number) {
        const width: number = ((this.width - this.gridContext.lineWidth) * pos) / this.boardGridSize + this.gridContext.lineWidth / 2;
        this.gridContext.moveTo(width, this.height / this.boardGridSize);
        this.gridContext.lineTo(width, this.height + this.gridContext.lineWidth / 2);
    }

    private fillSquares(color: string, initialPosition: Vec2, size: Vec2) {
        const canvasPosition = this.computeCanvasCoord(initialPosition);
        const squareWidth = this.squareWidth();
        const squareHeight = this.squareHeight();

        this.gridContext.fillStyle = color;
        this.gridContext.fillRect(
            canvasPosition.x - squareWidth / 2,
            canvasPosition.y - squareHeight / 2,
            squareWidth * size.x,
            squareHeight * size.y,
        );
    }

    private computeCanvasCoord(gridPosition: Vec2): Vec2 {
        return {
            x: this.computeCanvasPosition(gridPosition.x, this.canvasSize.x, this.boardGridSize),
            y: this.computeCanvasPosition(gridPosition.y, this.canvasSize.y, this.boardGridSize),
        };
    }

    private computeCanvasPosition(position: number, canvasSize: number, gridSize: number): number {
        return (canvasSize / gridSize) * position + canvasSize / gridSize / 2;
    }

    private squareWidth(): number {
        return this.canvasSize.x / this.boardGridSize;
    }

    private squareHeight(): number {
        return this.canvasSize.y / this.boardGridSize;
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
}
