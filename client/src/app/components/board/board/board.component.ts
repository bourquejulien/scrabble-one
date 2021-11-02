import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { PlayerType } from '@app/classes/player/player-type';
import { specialCharacter } from '@app/classes/special-character';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';
import { GridService } from '@app/services/grid/grid.service';
import { MouseHandlingService } from '@app/services/mouse-handling/mouse-handling.service';
import { PlaceLetterService } from '@app/services/place-letter/place-letter.service';
import { PlayerService } from '@app/services/player/player.service';
import { RackService } from '@app/services/rack/rack.service';
import { Direction, Vec2 } from '@common';
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
    isUpper: boolean;
    isLastSquare: boolean;
    letter: string;
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
        readonly playerService: PlayerService,
        readonly placeLetterService: PlaceLetterService,
    ) {
        this.tempRack = [];
        this.myRack = [];
    }

    @HostListener('body:mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        if (this.isFocus && this.myRack.length === 0) {
            this.mouseHandlingService.mouseHitDetect(event);
            if (this.gridPosition === undefined) {
                this.gridPosition = this.mouseHandlingService.position;
                this.positionInit = { x: this.gridPosition.x, y: this.gridPosition.y };
                this.gridService.resetCanvas(this.tempContext);
            } else {
                this.samePosition(this.mouseHandlingService.position);
                this.gridService.resetCanvas(this.tempContext);
            }
            const squareValid: boolean = this.inGrid(this.gridPosition) && this.boardService.positionIsAvailable(this.gridPosition);
            if (squareValid) {
                this.gridService.drawSelectionSquare(this.tempContext, this.gridPosition);
                const lastSquare =
                    (this.gridPosition.x === MAX_SIZE && this.isHorizontal) || (this.gridPosition.y === MAX_SIZE && !this.isHorizontal);
                if (!lastSquare) {
                    this.gridService.drawDirectionArrow(this.tempContext, this.gridPosition, this.isHorizontal);
                }
                this.squareSelected = true;
            }
        }
    }

    @HostListener('body:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const backSpaceValid: boolean = this.backSpaceEnable(event.key) && !this.isPositionInit() && this.inGrid(this.gridPosition);
        const enterValid: boolean = event.key === 'Enter' && this.tempRack.length > 0;
        const lastSquare = this.gridPosition.x > MAX_SIZE || this.gridPosition.y > MAX_SIZE;
        if (backSpaceValid) {
            this.backSpaceOperation();
            this.isLastSquare = false;
        } else if (event.key === 'Escape') {
            this.escapeOperation();
            this.isLastSquare = false;
        } else if (enterValid) {
            this.enterOperation();
        } else {
            this.handleKeyPress2(event.key);
            const validKey: boolean = this.squareSelected === true && this.isLetter && this.inGrid(this.gridPosition);
            if (validKey && !this.isLastSquare) {
                this.gridService.cleanSquare(this.tempContext, this.gridPosition);
                this.gridService.drawSymbol(this.letter, this.gridPosition, this.tempContext);
                if (this.isUpper) {
                    this.rackService.rack.splice(this.rackService.indexOf('*'), 1);
                    this.tempRack.push(this.letter);
                    this.myRack.push('*');
                } else {
                    this.rackService.rack.splice(this.rackService.indexOf(this.letter), 1);
                    this.tempRack.push(this.letter);
                    this.myRack.push(this.letter);
                }

                this.nextAvailableSquare(true);

                if (!lastSquare && !this.isLastSquare) {
                    this.gridService.drawSelectionSquare(this.tempContext, this.gridPosition);
                    this.gridService.drawDirectionArrow(this.tempContext, this.gridPosition, this.isHorizontal);
                } else {
                    this.gridService.drawSelectionSquare(this.tempContext, this.gridPosition);
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
    // place letter
    private samePosition(position: Vec2) {
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
    // in place letter
    private isPositionInit(): boolean {
        if (this.gridPosition.x === this.positionInit.x && this.gridPosition.y === this.positionInit.y) {
            return true;
        } else return false;
    }
    // placeletter
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
    // placeletter service
    private backSpaceEnable(key: string): boolean {
        if (key === 'Backspace' && this.squareSelected) {
            return true;
        } else {
            return false;
        }
    }
    // placeLetter service
    private nextAvailableSquare(isForward: boolean): void {
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
    // in place letter
    private cancel(): void {
        for (let i = this.myRack.length - 1; i >= 0; i--) {
            this.rackService.rack.push(this.myRack[i]);
            this.myRack.pop();
        }
        this.tempRack = [];
    }
    // placeLetter service
    private backSpaceOperation(): void {
        this.gridService.clearSquare(this.tempContext, this.gridPosition);
        if (this.isHorizontal) {
            this.gridService.cleanSquare(this.tempContext, { x: this.gridPosition.x - 1, y: this.gridPosition.y });
        } else this.gridService.cleanSquare(this.tempContext, { x: this.gridPosition.x, y: this.gridPosition.y - 1 });

        this.rackService.rack.push(this.myRack[this.myRack.length - 1]);
        this.tempRack.pop();
        this.myRack.pop();
        this.nextAvailableSquare(false);
        this.gridService.drawSelectionSquare(this.tempContext, this.gridPosition);
        this.gridService.drawDirectionArrow(this.tempContext, this.gridPosition, this.isHorizontal);
    }
    // place letter
    private escapeOperation(): void {
        this.gridService.resetCanvas(this.tempContext);
        this.cancel();
        this.isHorizontal = true;
    }
    // in place letter
    private enterOperation(): void {
        let word = '';
        let direction: Direction;
        if (this.isHorizontal) {
            direction = Direction.Right;
        } else direction = Direction.Down;
        for (const letter of this.tempRack) {
            word += letter;
        }

        this.playerService.placeLetters(word, this.positionInit, direction);
    }
}
