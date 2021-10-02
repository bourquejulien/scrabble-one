import { Injectable } from '@angular/core';
import { Bonus } from '@app/classes/board/bonus';
import { FontFace } from '@app/classes/font-face';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';

const STAR_IMAGE_PATH = 'assets/img/star.svg';
const LINE_WIDTH = 3;
const STROKE_STYLE = 'black';
const FONT_FACE: FontFace = { font: 'BenchNine', size: 30 };
const MIN_FONT_SIZE = 25;
const MAX_FONT_SIZE = 35;
const FONT_FACE_SCALE_FACTOR = 0.75;
const TEXT_STYLE = 'black';
const BONUS_COLORS = new Map([
    [Bonus.None, '#C6BDA6'],
    [Bonus.L2, '#9ea6ff'],
    [Bonus.L3, '#6571ff'],
    [Bonus.W2, '#ffcccb'],
    [Bonus.W3, '#ff7d7a'],
    [Bonus.Star, '#ffcccb'],
]);

@Injectable({
    providedIn: 'root',
})
export class GridService {
    readonly minFontSize: number = MIN_FONT_SIZE;
    readonly maxFontSize: number = MAX_FONT_SIZE;
    letterFontFace = FONT_FACE;

    private readonly canvasSize: Vec2 = Constants.GRID.CANVAS_SIZE;
    private readonly playGridSize: number = Constants.GRID.GRID_SIZE;
    private readonly starImage: HTMLImageElement;

    constructor(private readonly boardService: BoardService) {
        this.starImage = new Image();
        this.starImage.src = STAR_IMAGE_PATH;
    }

    private static getBonusText(bonus: Bonus): { kind: string; multiplier: string } {
        switch (bonus) {
            case Bonus.L2:
                return { kind: 'Lettre', multiplier: 'X2' };
            case Bonus.L3:
                return { kind: 'Lettre', multiplier: 'X3' };
            case Bonus.W2:
                return { kind: 'Mot', multiplier: 'X2' };
            case Bonus.W3:
                return { kind: 'Mot', multiplier: 'X3' };
            case Bonus.Star:
            default:
                return { kind: '', multiplier: '' };
        }
    }

    drawGrid(gridContext: CanvasRenderingContext2D): void {
        const board = this.boardService.gameBoard;
        gridContext.clearRect(0, 0, this.width, this.height);

        for (let i = 1; i < this.playGridSize + 1; i++) {
            this.drawSymbol(i.toString(), { x: i, y: 0 }, gridContext);
            this.drawSymbol(String.fromCharCode('A'.charCodeAt(0) + i - 1), { x: 0, y: i }, gridContext);
        }

        for (let x = 0; x < this.playGridSize; x++) {
            for (let y = 0; y < this.playGridSize; y++) {
                const square = board.getSquare({ x, y });
                const squareColor = BONUS_COLORS.get(square.bonus) ?? 'white';
                this.fillSquare(squareColor, { x: x + 1, y: y + 1 }, { x: 1, y: 1 }, gridContext);
            }
        }

        gridContext.beginPath();
        gridContext.strokeStyle = STROKE_STYLE;
        gridContext.lineWidth = LINE_WIDTH;

        for (let i = 1; i < this.boardGridSize + 1; i++) {
            this.drawRow(i, gridContext);
        }

        for (let i = 1; i < this.boardGridSize + 1; i++) {
            this.drawColumn(i, gridContext);
        }

        gridContext.stroke();
    }

    drawSquares(squareContext: CanvasRenderingContext2D): void {
        const board = this.boardService.gameBoard;
        squareContext.clearRect(0, 0, this.width, this.height);

        for (let x = 0; x < this.playGridSize; x++) {
            for (let y = 0; y < this.playGridSize; y++) {
                const square = board.getSquare({ x, y });
                if (square.letter !== '') {
                    this.drawSymbol(square.letter.toUpperCase(), { x: x + 1, y: y + 1 }, squareContext);
                } else if (square.bonus !== Bonus.None) {
                    this.drawBonus(square.bonus, { x: x + 1, y: y + 1 }, squareContext);
                }
            }
        }

        const centerSquare = Math.floor(this.playGridSize / 2);

        if (board.getSquare({ x: centerSquare, y: centerSquare }).letter === '') {
            this.drawImage(this.starImage, { x: centerSquare + 1, y: centerSquare + 1 }, squareContext);
        }
    }

    drawSymbol(letter: string, gridPosition: Vec2, context: CanvasRenderingContext2D) {
        if (letter.length === 0) return;

        const canvasPosition: Vec2 = this.computeCanvasCoord(gridPosition);

        this.fitTextSize(letter, this.letterFontFace, context);

        context.fillStyle = TEXT_STYLE;
        context.textBaseline = 'middle';
        context.textAlign = 'center';
        context.fillText(letter, canvasPosition.x, canvasPosition.y);
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    get boardGridSize(): number {
        return this.playGridSize + 1;
    }

    private drawBonus(bonus: Bonus, gridPosition: Vec2, context: CanvasRenderingContext2D) {
        if (bonus === Bonus.None) return;

        const canvasPosition: Vec2 = this.computeCanvasCoord(gridPosition);
        const { kind, multiplier } = GridService.getBonusText(bonus);

        this.fitTextSize(kind, this.bonusFontFace, context);
        context.fillStyle = TEXT_STYLE;
        context.textAlign = 'center';

        context.textBaseline = 'top';
        context.fillText(kind, canvasPosition.x, canvasPosition.y);

        context.textBaseline = 'alphabetic';
        context.fillText(multiplier, canvasPosition.x, canvasPosition.y, this.squareWidth);
    }

    private fitTextSize(text: string, fontFace: FontFace, context: CanvasRenderingContext2D): FontFace {
        context.font = `${fontFace.size}px ${fontFace.font}`;

        while (context.measureText(text).width > this.squareWidth) {
            fontFace.size--;
            context.font = `${fontFace.size}px ${fontFace.font}`;
        }

        return fontFace;
    }

    private async drawImage(image: HTMLImageElement, gridPosition: Vec2, context: CanvasRenderingContext2D) {
        const canvasPosition = this.computeCanvasCoord(gridPosition);
        const halfLineWidth = LINE_WIDTH / 2;
        const centeredPosition = {
            x: canvasPosition.x - this.squareWidth / 2 + halfLineWidth,
            y: canvasPosition.y - this.squareHeight / 2 + halfLineWidth,
        };

        const drawImage = () =>
            context.drawImage(image, centeredPosition.x, centeredPosition.y, this.squareWidth - LINE_WIDTH, this.squareHeight - LINE_WIDTH);

        if (image.complete) {
            drawImage();
        }
        image.onload = () => drawImage();
    }

    private drawRow(pos: number, context: CanvasRenderingContext2D) {
        const height: number = ((this.height - context.lineWidth) * pos) / this.boardGridSize + context.lineWidth / 2;
        context.moveTo(this.width / this.boardGridSize + context.lineWidth / 2, height);
        context.lineTo(this.width + context.lineWidth / 2, height);
    }

    private drawColumn(pos: number, context: CanvasRenderingContext2D) {
        const width: number = ((this.width - context.lineWidth) * pos) / this.boardGridSize + context.lineWidth / 2;
        context.moveTo(width, this.height / this.boardGridSize);
        context.lineTo(width, this.height + context.lineWidth / 2);
    }

    private fillSquare(color: string, initialPosition: Vec2, size: Vec2, context: CanvasRenderingContext2D) {
        const canvasPosition = this.computeCanvasCoord(initialPosition);
        const squareWidth = this.squareWidth;
        const squareHeight = this.squareHeight;

        context.fillStyle = color;
        context.fillRect(canvasPosition.x - squareWidth / 2, canvasPosition.y - squareHeight / 2, squareWidth * size.x, squareHeight * size.y);
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

    private get squareWidth(): number {
        return this.canvasSize.x / this.boardGridSize;
    }

    private get squareHeight(): number {
        return this.canvasSize.y / this.boardGridSize;
    }

    private get bonusFontFace(): FontFace {
        return { font: this.letterFontFace.font, size: this.letterFontFace.size * FONT_FACE_SCALE_FACTOR };
    }
}
