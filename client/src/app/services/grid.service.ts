import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/constants/global.constants';

@Injectable({
    providedIn: 'root',
})
export class GridService {
    gridContext: CanvasRenderingContext2D;
    private canvasSize: Vec2 = Constants.Grid.CANVAS_SIZE;
    private gridSize: number = Constants.Grid.GRID_SIZE;

    // TODO : pas de valeurs magiques!! Faudrait avoir une meilleure manière de le faire
    /* eslint-disable @typescript-eslint/no-magic-numbers */
    drawGrid() {
        this.fillBoard(Constants.Grid.DEFAULT_BACKGROUND_COLOR);

        this.gridContext.beginPath();
        this.gridContext.strokeStyle = Constants.Grid.STROKE_STYLE;
        this.gridContext.lineWidth = Constants.Grid.DEFAULT_LINE_WIDTH;

        for (let i = 0; i < this.gridSize + 1; i++) {
            this.drawRow(i);
        }

        for (let i = 0; i < this.gridSize + 1; i++) {
            this.drawColumn(i);
        }

        this.gridContext.stroke();
    }

    drawLetter(letter: string, gridPosition: Vec2) {
        if (letter.length !== 1) return;

        const canvasPosition: Vec2 = this.computeCanvasCoord(gridPosition);

        //TODO Improve text scaling
        this.gridContext.fillStyle = 'black';
        this.gridContext.font = '35px system-ui';
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(letter, canvasPosition.x, canvasPosition.y);
    }

    private drawRow(pos: number) {
        const height: number = ((this.height - this.gridContext.lineWidth) * pos) / this.gridSize + this.gridContext.lineWidth / 2;
        this.gridContext.moveTo(this.gridContext.lineWidth / 2, height);
        this.gridContext.lineTo(this.width + this.gridContext.lineWidth / 2, height);
    }

    private drawColumn(pos: number) {
        const width: number = ((this.width - this.gridContext.lineWidth) * pos) / this.gridSize + this.gridContext.lineWidth / 2;
        this.gridContext.moveTo(width, 0);
        this.gridContext.lineTo(width, this.height + this.gridContext.lineWidth / 2);
    }

    private fillBoard(color: string) {
        this.gridContext.fillStyle = color;
        this.gridContext.fillRect(0, 0, this.canvasSize.x, this.canvasSize.y);
    }

    private computeCanvasCoord(gridPosition: Vec2): Vec2 {
        return {
            x: this.computeCanvasPosition(gridPosition.x, this.canvasSize.x, this.gridSize),
            y: this.computeCanvasPosition(gridPosition.y, this.canvasSize.y, this.gridSize),
        };
    }

    private computeCanvasPosition(position: number, canvasSize: number, gridSize: number): number {
        return (canvasSize / gridSize) * position + canvasSize / gridSize / 2;
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
}
