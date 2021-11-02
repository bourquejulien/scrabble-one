import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { PlayerType } from '@app/classes/player/player-type';
import { specialCharacter } from '@app/classes/special-character';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';
import { GridService } from '@app/services/grid/grid.service';
import { MouseHandlingService } from '@app/services/mouse-handling/mouse-handling.service';
import { PlaceLetterService } from '@app/services/place-letter/place-letter.service';
import { RackService } from '@app/services/rack/rack.service';
import FontFaceObserver from 'fontfaceobserver';
// TODO add to constant file
const MAX_SIZE = 15;

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
    isUpper: boolean;
    letter: string;
    squareSelected: boolean = false;

    private gridContext: CanvasRenderingContext2D;
    private squareContext: CanvasRenderingContext2D;
    private tempContext: CanvasRenderingContext2D;

    constructor(
        readonly gridService: GridService,
        readonly mouseHandlingService: MouseHandlingService,
        readonly rackService: RackService,
        readonly boardService: BoardService,

        readonly placeLetterService: PlaceLetterService,
    ) {}

    @HostListener('body:mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        if (this.isFocus && this.placeLetterService.myRack.length === 0) {
            this.mouseHandlingService.mouseHitDetect(event);
            if (this.placeLetterService.gridPosition === undefined) {
                this.placeLetterService.gridPosition = this.mouseHandlingService.position;
                this.placeLetterService.positionInit = { x: this.placeLetterService.gridPosition.x, y: this.placeLetterService.gridPosition.y };
                this.gridService.resetCanvas(this.tempContext);
            } else {
                this.placeLetterService.samePosition(this.mouseHandlingService.position);
                this.gridService.resetCanvas(this.tempContext);
            }
            const squareValid: boolean =
                this.placeLetterService.inGrid(this.placeLetterService.gridPosition) &&
                this.boardService.positionIsAvailable(this.placeLetterService.gridPosition);
            if (squareValid) {
                this.gridService.cleanInsideSquare(this.squareContext, this.placeLetterService.gridPosition);
                this.gridService.drawSelectionSquare(this.tempContext, this.placeLetterService.gridPosition);
                const lastSquare =
                    (this.placeLetterService.gridPosition.x === MAX_SIZE && this.placeLetterService.isHorizontal) ||
                    (this.placeLetterService.gridPosition.y === MAX_SIZE && !this.placeLetterService.isHorizontal);
                if (!lastSquare) {
                    this.gridService.drawDirectionArrow(this.tempContext, this.placeLetterService.gridPosition, this.placeLetterService.isHorizontal);
                }
                this.squareSelected = true;
            }
        }
    }

    @HostListener('body:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const backSpaceValid: boolean =
            this.placeLetterService.backSpaceEnable(event.key, this.squareSelected) &&
            !this.isPositionInit() &&
            this.placeLetterService.inGrid(this.placeLetterService.gridPosition);

        const enterValid: boolean = event.key === 'Enter' && this.placeLetterService.tempRack.length > 0;
        const lastSquare = this.placeLetterService.gridPosition.x > MAX_SIZE || this.placeLetterService.gridPosition.y > MAX_SIZE;
        if (backSpaceValid) {
            this.placeLetterService.backSpaceOperation(this.tempContext);
            this.gridService.drawBonusOfPosition(this.squareContext, this.placeLetterService.gridPosition);
            this.placeLetterService.isLastSquare = false;
        } else if (event.key === 'Escape') {
            this.placeLetterService.escapeOperation(this.tempContext);
            this.placeLetterService.isLastSquare = false;
            this.gridService.drawSquares(this.squareContext);
            this.squareSelected = false;
        } else if (enterValid) {
            this.placeLetterService.enterOperation();
            this.gridService.resetCanvas(this.tempContext);
        } else {
            this.handleKeyPress2(event.key);
            const validKey: boolean =
                this.squareSelected === true && this.isLetter && this.placeLetterService.inGrid(this.placeLetterService.gridPosition);
            if (validKey && !this.placeLetterService.isLastSquare) {
                this.gridService.cleanInsideSquare(this.tempContext, this.placeLetterService.gridPosition);
                this.gridService.cleanInsideSquare(this.squareContext, this.placeLetterService.gridPosition);
                this.gridService.drawSymbol(this.letter, this.placeLetterService.gridPosition, this.tempContext);
                if (this.isUpper) {
                    this.rackService.rack.splice(this.rackService.indexOf('*'), 1);
                    this.placeLetterService.tempRack.push(this.letter);
                    this.placeLetterService.myRack.push('*');
                } else {
                    this.rackService.rack.splice(this.rackService.indexOf(this.letter), 1);
                    this.placeLetterService.tempRack.push(this.letter);
                    this.placeLetterService.myRack.push(this.letter);
                }

                this.placeLetterService.nextAvailableSquare(true);
                this.gridService.cleanInsideSquare(this.squareContext, this.placeLetterService.gridPosition);

                if (!lastSquare && !this.placeLetterService.isLastSquare) {
                    this.gridService.drawSelectionSquare(this.tempContext, this.placeLetterService.gridPosition);
                    this.gridService.drawDirectionArrow(this.tempContext, this.placeLetterService.gridPosition, this.placeLetterService.isHorizontal);
                } else {
                    this.gridService.drawSelectionSquare(this.tempContext, this.placeLetterService.gridPosition);
                }
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

    private handleKeyPress2(key: string): void {
        const input = specialCharacter.get(key);
        if (input === undefined) {
            if (key.length !== 1 || !key.match('([a-zA-Z])')) {
                this.isLetter = false;
            } else {
                if (key === key.toUpperCase()) {
                    if (this.rackService.rack.includes('*')) {
                        this.isLetter = true;
                        this.letter = key;
                        this.isUpper = true;
                    } else {
                        this.isLetter = false;
                    }
                } else {
                    if (this.rackService.rack.includes(key)) {
                        this.isLetter = true;
                        this.letter = key;
                        this.isUpper = false;
                    } else {
                        this.isLetter = false;
                    }
                }
            }
        } else {
            if (input === input.toUpperCase()) {
                if (this.rackService.rack.includes(input)) {
                    this.isLetter = true;
                    this.letter = input;
                    this.isUpper = true;
                } else {
                    this.isLetter = false;
                }
            } else {
                if (this.rackService.rack.includes(input)) {
                    this.isLetter = true;
                    this.letter = input;
                    this.isUpper = false;
                } else {
                    this.isLetter = false;
                }
            }
        }
    }
    private isPositionInit(): boolean {
        if (
            this.placeLetterService.gridPosition.x === this.placeLetterService.positionInit.x &&
            this.placeLetterService.gridPosition.y === this.placeLetterService.positionInit.y
        ) {
            return true;
        } else return false;
    }
}
