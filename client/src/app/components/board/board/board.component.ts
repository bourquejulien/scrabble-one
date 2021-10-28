import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { PlayerType } from '@app/classes/player/player-type';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';
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
    gridPosition: Vec2;
    positionInit: Vec2;
    tempRack: string[];
    myRack: string[];
    private gridContext: CanvasRenderingContext2D;
    private squareContext: CanvasRenderingContext2D;
    private tempContext: CanvasRenderingContext2D;

    constructor(
        readonly gridService: GridService,
        readonly mouseHandlingService: MouseHandlingService,
        readonly rackService: RackService,
        readonly boardService: BoardService,
    ) {
        this.tempRack = [];
        this.myRack = [];
    }

    @HostListener('body:mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        this.gridService.resetCanvas(this.tempContext);
        if (this.isFocus && !this.squareSelected) {
            this.mouseHandlingService.mouseHitDetect(event);
            if (this.gridPosition === undefined) {
                this.gridPosition = this.mouseHandlingService.position;
                this.positionInit = { x: this.gridPosition.x, y: this.gridPosition.y };
            } else {
                this.samePosition(this.mouseHandlingService.position);
            }
            const squareValid: boolean = this.inGrid(this.gridPosition) && this.boardService.positionIsAvailable(this.gridPosition);
            if (squareValid) {
                this.gridService.drawSelectionSquare(this.tempContext, this.gridPosition);
                this.gridService.drawDirectionArrow(this.tempContext, this.gridPosition, this.isHorizontal);
                this.squareSelected = true;
            }
        } else {
            this.cancel();
            this.gridPosition.x = -1;
            this.gridPosition.y = -1;
        }
    }

    @HostListener('body:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const backSpaceValid: boolean = this.backSpaceEnable(event.key) && !this.isPositionInit() && this.inGrid(this.gridPosition);
        if (backSpaceValid) {
            this.gridService.clearSquare(this.tempContext, this.gridPosition);
            this.nextAvailableSquare(false);
            this.rackService.rack.push(this.tempRack[this.tempRack.length - 1]);
            this.tempRack.pop();
            this.gridService.drawSelectionSquare(this.tempContext, this.gridPosition);
            this.gridService.drawDirectionArrow(this.tempContext, this.gridPosition, this.isHorizontal);
        } else if (event.key === 'Escape') {
            this.gridService.resetCanvas(this.tempContext);
            this.cancel();
        } else {
            this.handleKeyPress(event.key);
            const validKey: boolean = this.squareSelected === true && this.isLetter && this.inGrid(this.gridPosition);
            if (validKey) {
                this.gridService.cleanSquare(this.tempContext, this.gridPosition);
                this.gridService.drawSymbol(event.key, this.gridPosition, this.tempContext);
                this.rackService.rack.splice(this.rackService.indexOf(event.key), 1);
                this.tempRack.push(event.key);
                this.myRack.push(event.key);
                this.nextAvailableSquare(true);
                this.gridService.drawSelectionSquare(this.tempContext, this.gridPosition);
                this.gridService.drawDirectionArrow(this.tempContext, this.gridPosition, this.isHorizontal);
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
        if (key.length !== 1 || !key.match('([a-z])')) {
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
        if (this.gridPosition.x === position.x && this.gridPosition.y === position.y) {
            this.isHorizontal = false;
        } else {
            this.cancel();
            this.gridPosition = position;
            this.positionInit = { x: position.x, y: position.y };
            this.isHorizontal = true;
        }
    }

    private isPositionInit(): boolean {
        if (this.gridPosition.x === this.positionInit.x && this.gridPosition.y === this.positionInit.y) {
            return true;
        } else return false;
    }

    private inGrid(position: Vec2): boolean {
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

    private backSpaceEnable(key: string): boolean {
        if (key === 'Backspace' && this.squareSelected) {
            return true;
        } else {
            return false;
        }
    }

    private nextAvailableSquare(isForward: boolean): void {
        if (isForward) {
            do {
                if (!this.boardService.positionIsAvailable(this.gridPosition)) {
                    this.tempRack.push(this.boardService.getLetter(this.gridPosition));
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
