import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { PlayerType } from '@app/classes/player/player-type';
import { Constants } from '@app/constants/global.constants';
import { GridService } from '@app/services/grid/grid.service';
import { MouseHandlingService } from '@app/services/mouse-handling/mouse-handling.service';
import { RackService } from '@app/services/rack/rack.service';
import { Vec2 } from '@common';
import FontFaceObserver from 'fontfaceobserver';

const MAX_SIZE = 15;
const MIN_SIZE = 1;

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
    isHorizontal: boolean = true;
    position: Vec2;
    positionInit: Vec2;
    private gridContext: CanvasRenderingContext2D;
    private squareContext: CanvasRenderingContext2D;
    private tempContext: CanvasRenderingContext2D;

    constructor(readonly gridService: GridService, readonly mouseHandlingService: MouseHandlingService, readonly rackService: RackService) {}

    @HostListener('body:mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        console.log(this.rackService.rack);
        this.gridService.resetCanvas(this.tempContext);
        if (this.isFocus) {
            this.mouseHandlingService.mouseHitDetect(event);
            if (this.position === undefined) {
                this.position = this.mouseHandlingService.position;
                this.positionInit = this.mouseHandlingService.position;
            } else {
                this.samePosition(this.mouseHandlingService.position);
            }
            if (this.position.x > 0 && this.position.y > 0) {
                this.gridService.drawSelectionSquare(this.tempContext, this.position);
                this.gridService.drawDirectionArrow(this.tempContext, this.position, this.isHorizontal);
                this.squareSelected = true;
            }
        }
    }

    @HostListener('body:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Backspace' && this.isPositionInit()) {
            this.gridService.clearSquare(this.tempContext, this.position);
            if (this.isHorizontal && this.position.x > MIN_SIZE) {
                this.position.x -= 1;
            } else if (!this.isHorizontal && this.position.y > MIN_SIZE) {
                this.position.y -= 1;
            }
            this.gridService.drawSelectionSquare(this.tempContext, this.position);
            this.gridService.drawDirectionArrow(this.tempContext, this.position, this.isHorizontal);
        } else {
            this.handleKeyPress(event.key);
            if (this.squareSelected === true && this.isLetter) {
                this.gridService.cleanSquare(this.tempContext, this.position);
                this.gridService.drawSymbol(event.key, this.position, this.tempContext);
                if (this.isHorizontal && this.position.x < MAX_SIZE) {
                    this.position.x += 1;
                } else if (!this.isHorizontal && this.position.y < MAX_SIZE) {
                    this.position.y += 1;
                }
                this.gridService.drawSelectionSquare(this.tempContext, this.position);
                this.gridService.drawDirectionArrow(this.tempContext, this.position, this.isHorizontal);
            }
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

    private handleKeyPress(key: string): void {
        if (key.length !== 1 || !key.match('([a-z]|\\*)')) {
            this.isLetter = false;
        } else {
            if (this.rackService.rack.includes(key)) {
                this.isLetter = true;
            } else {
                this.isLetter = false;
            }
        }
    }

    private samePosition(position: Vec2) {
        if (this.position.x === position.x && this.position.y === position.y) {
            this.isHorizontal = false;
        } else {
            this.position = position;
            this.positionInit = position;
            this.isHorizontal = true;
        }
    }

    private isPositionInit(): boolean {
        if (this.position.x === this.positionInit.x && this.position.y === this.positionInit.y) {
            return true;
        } else return false;
    }
}
