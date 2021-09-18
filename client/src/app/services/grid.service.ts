import { Injectable } from '@angular/core';
import { ImmutableBoard } from '@app/classes/board/board';
import { Bonus } from '@app/classes/board/bonus';
import { Vec2 } from '@app/classes/vec2';
import { FontFace } from '@app/classes/font-face';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from './board.service';

@Injectable({
    providedIn: 'root',
})
export class GridService {
    gridContext: CanvasRenderingContext2D;
    squareContext: CanvasRenderingContext2D;
    letterFontFace = Constants.grid.FONT_FACE;

    private readonly board: ImmutableBoard;

    private readonly canvasSize: Vec2 = Constants.grid.CANVAS_SIZE;
    private readonly playGridSize: number = Constants.grid.GRID_SIZE;
    private readonly boardGridSize: number = Constants.grid.GRID_SIZE + 1;

    constructor(boardService: BoardService) {
        this.board = boardService.gameBoard;
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
            default:
                return { kind: '', multiplier: '' };
        }
    }

    drawGridCanvas() {
        for (let i = 1; i < this.playGridSize + 1; i++) {
            this.drawSymbol(i.toString(), { x: i, y: 0 }, this.gridContext);
            this.drawSymbol(String.fromCharCode('A'.charCodeAt(0) + i - 1), { x: 0, y: i }, this.gridContext);
        }

        for (let x = 0; x < this.playGridSize + 1; x++) {
            for (let y = 0; y < this.playGridSize + 1; y++) {
                const square = this.board.getSquare({ x, y });
                this.fillSquare(Constants.grid.BONUS_COLORS.get(square.bonus) ?? 'white', { x: x + 1, y: y + 1 }, { x: 1, y: 1 });
            }
        }

        this.drawImage('/assets/img/star.svg', { x: 8, y: 8 }, this.gridContext);

        this.gridContext.beginPath();
        this.gridContext.strokeStyle = Constants.grid.STROKE_STYLE;
        this.gridContext.lineWidth = Constants.grid.LINE_WIDTH;

        for (let i = 1; i < this.boardGridSize + 1; i++) {
            this.drawRow(i);
        }

        for (let i = 1; i < this.boardGridSize + 1; i++) {
            this.drawColumn(i);
        }

        this.gridContext.stroke();
    }

    drawSquareCanvas() {
        for (let x = 0; x < this.playGridSize + 1; x++) {
            for (let y = 0; y < this.playGridSize + 1; y++) {
                const square = this.board.getSquare({ x, y });
                if (square.letter !== '') {
                    this.drawSymbol(square.letter, { x: x + 1, y: y + 1 }, this.squareContext);
                } else if (square.bonus !== Bonus.None) {
                    this.drawBonus(square.bonus, { x: x + 1, y: y + 1 });
                }
            }
        }
        this.drawImage('/assets/img/star.png', { x: 8, y: 8 }, this.gridContext);
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    private drawBonus(bonus: Bonus, gridPosition: Vec2) {
        if (bonus === Bonus.None) return;

        const canvasPosition: Vec2 = this.computeCanvasCoord(gridPosition);
        const { kind, multiplier } = GridService.getBonusText(bonus);

        this.fitTextSize(kind, this.bonusFontFace, this.squareContext);
        this.squareContext.fillStyle = Constants.grid.TEXT_STYLE;
        this.squareContext.textAlign = 'center';

        this.squareContext.textBaseline = 'top';
        this.squareContext.fillText(kind, canvasPosition.x, canvasPosition.y);

        this.squareContext.textBaseline = 'alphabetic';
        this.squareContext.fillText(multiplier, canvasPosition.x, canvasPosition.y, this.squareWidth);
    }

    private drawSymbol(letter: string, gridPosition: Vec2, context: CanvasRenderingContext2D) {
        if (letter.length === 0) return;

        const canvasPosition: Vec2 = this.computeCanvasCoord(gridPosition);

        this.fitTextSize(letter, this.letterFontFace, context);

        context.fillStyle = Constants.grid.TEXT_STYLE;
        context.textBaseline = 'middle';
        context.textAlign = 'center';
        context.fillText(letter, canvasPosition.x, canvasPosition.y);
    }

    private fitTextSize(text: string, fontFace: FontFace, context: CanvasRenderingContext2D): FontFace {
        context.font = `${fontFace.size}px ${fontFace.font}`;

        while (context.measureText(text).width > this.squareWidth) {
            fontFace.size--;
            context.font = `${fontFace.size}px ${fontFace.font}`;
        }

        return fontFace;
    }

    private drawImage(imagePath: string, gridPosition: Vec2, context: CanvasRenderingContext2D) {
        const image = new Image();
        const canvasPosition = this.computeCanvasCoord(gridPosition);
        const centeredPosition = { x: canvasPosition.x - this.squareWidth / 2, y: canvasPosition.y - this.squareHeight / 2 };
        image.src = imagePath;
        image.onload = () => context.drawImage(image, centeredPosition.x, centeredPosition.y, this.squareWidth, this.squareHeight);
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

    private fillSquare(color: string, initialPosition: Vec2, size: Vec2) {
        const canvasPosition = this.computeCanvasCoord(initialPosition);
        const squareWidth = this.squareWidth;
        const squareHeight = this.squareHeight;

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

    private get squareWidth(): number {
        return this.canvasSize.x / this.boardGridSize;
    }

    private get squareHeight(): number {
        return this.canvasSize.y / this.boardGridSize;
    }

    private get bonusFontFace(): FontFace {
        return { font: this.letterFontFace.font, size: this.letterFontFace.size * Constants.grid.FONT_FACE_SCALE_FACTOR };
    }
}
