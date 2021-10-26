import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { PlayerType } from '@app/classes/player/player-type';
import { Constants } from '@app/constants/global.constants';
import { GridService } from '@app/services/grid/grid.service';
import { MouseHandlingService } from '@app/services/mouse-handling/mouse-handling.service';
import { Vec2 } from '@common';
import FontFaceObserver from 'fontfaceobserver';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnChanges, AfterViewInit {
    @Input() playerType: PlayerType;

    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('squareCanvas', { static: false }) private squareCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('tempCanvas', { static: false }) private tempCanvas!: ElementRef<HTMLCanvasElement>;

    isLetter: boolean;
    isFocus: boolean;
    squareSelected: boolean = false;
    position: Vec2;
    private gridContext: CanvasRenderingContext2D;
    private squareContext: CanvasRenderingContext2D;
    private tempContext: CanvasRenderingContext2D;

    constructor(readonly gridService: GridService, readonly mouseHandlingService: MouseHandlingService) {}

    @HostListener('body:mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        this.gridService.resetCanvas(this.tempContext);
        if (this.isFocus) {
            this.mouseHandlingService.mouseHitDetect(event);
            this.position = this.mouseHandlingService.position; // position on the grid
            if (this.position.x > 0 && this.position.y > 0) {
                this.gridService.drawSelectionSquare(this.tempContext, this.position);
                this.squareSelected = true;
            }
        }
    }
    @HostListener('body:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.handleKeyPress(event.key);
        if (this.squareSelected === true && this.isLetter) {
            this.gridService.drawSymbol(event.key, this.position, this.tempContext);
            this.position.x += 1;
            this.gridService.drawSelectionSquare(this.tempContext, this.position);
        }
    }

    ngAfterViewInit(): void {
        this.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.squareContext = this.squareCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.tempContext = this.tempCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        this.scale();

        new FontFaceObserver(this.gridService.letterFontFace.font).load().then(() => {
            this.gridService.drawGrid(this.gridContext);
            this.gridService.drawSquares(this.squareContext);
            this.squareCanvas.nativeElement.focus();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes.playerType.isFirstChange() && changes.playerType.currentValue !== changes.playerType.previousValue) {
            this.gridService.drawSquares(this.squareContext);
        }
    }

    get width(): number {
        return Constants.GRID.CANVAS_SIZE.x;
    }

    get height(): number {
        return Constants.GRID.CANVAS_SIZE.y;
    }

    scale(): void {
        const gridCanvas = this.gridCanvas.nativeElement;
        const squareCanvas = this.squareCanvas.nativeElement;
        const scaleFactor = window.devicePixelRatio;

        squareCanvas.width = gridCanvas.width = Math.ceil(gridCanvas.width * scaleFactor);
        squareCanvas.height = gridCanvas.height = Math.ceil(gridCanvas.height * scaleFactor);
        this.gridContext.scale(scaleFactor, scaleFactor);
        this.squareContext.scale(scaleFactor, scaleFactor);
    }

    updateFontSize(size: number): void {
        this.gridService.letterFontFace.size = size;
        this.gridService.drawGrid(this.gridContext);
        this.gridService.drawSquares(this.squareContext);
    }

    handleKeyPress(key: string): void {
        if (key.length !== 1 || !key.match('([a-z]|\\*)')) {
            this.isLetter = false;
        } else {
            this.isLetter = true;
        }
    }
}
