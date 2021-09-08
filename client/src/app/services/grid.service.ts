import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';

// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!
export const DEFAULT_WIDTH = 500;
export const DEFAULT_HEIGHT = 500;
export const DEFAULT_LINE_WIDTH = 3;
export const DEFAULT_GRID_SIZE = 15;
export const DEFAULT_BACKGROUND_COLOR = "#C6BDA6";


@Injectable({
    providedIn: 'root',
})
export class GridService {
    gridContext: CanvasRenderingContext2D;
    private canvasSize: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    private gridSize: number = DEFAULT_GRID_SIZE;

    // TODO : pas de valeurs magiques!! Faudrait avoir une meilleure manière de le faire
    /* eslint-disable @typescript-eslint/no-magic-numbers */
    drawGrid() {
        this.fillBoard(DEFAULT_BACKGROUND_COLOR)

        this.gridContext.beginPath();
        this.gridContext.strokeStyle = 'black';
        this.gridContext.lineWidth = DEFAULT_LINE_WIDTH;

        for (let i = 0; i < this.gridSize + 1; i++) {
            this.drawRow(i);
        }

        for (let i = 0; i < this.gridSize + 1; i++) {
            this.drawColumn(i);
        }

        this.gridContext.stroke();
    }

    private drawRow(pos: number) {
        const height: number = (((this.height - this.gridContext.lineWidth) * pos) / this.gridSize) + this.gridContext.lineWidth / 2;
        this.gridContext.moveTo(this.gridContext.lineWidth / 2, height);
        this.gridContext.lineTo(this.width + this.gridContext.lineWidth / 2, height);
    }

    private drawColumn(pos: number) {
        const width: number = (((this.width - this.gridContext.lineWidth) * pos) / this.gridSize) + this.gridContext.lineWidth / 2;
        this.gridContext.moveTo(width, 0);
        this.gridContext.lineTo(width, this.height + this.gridContext.lineWidth / 2);
    }

    private fillBoard(color: string) {
        this.gridContext.fillStyle = color;
        this.gridContext.fillRect(0, 0, this.canvasSize.x, this.canvasSize.y);
    }

    public drawLetter(letter: string, gridPosition: Vec2) {
        if (letter.length != 1) return;

        const canvasPosition: Vec2 = this.computeCanvasCoord(gridPosition);
        this.gridContext.fillStyle = "black";
        this.gridContext.font = '25px system-ui';
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = "center";
        this.gridContext.fillText(letter, canvasPosition.x, canvasPosition.y);
    }

    private computeCanvasCoord = (gridPosition: Vec2): Vec2 => ({ x: this.computeCanvasPosition(gridPosition.x, this.canvasSize.x, this.gridSize), y: this.computeCanvasPosition(gridPosition.y, this.canvasSize.y, this.gridSize) });

    private computeCanvasPosition = (position: number, canvasSize: number, gridSize: number): number => (canvasSize / gridSize) * position + (canvasSize / gridSize / 2);

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
}
