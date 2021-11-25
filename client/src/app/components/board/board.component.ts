import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { PlayerType } from '@app/classes/player/player-type';
import { SPECIAL_CHARACTERS } from '@app/classes/special-character';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';
import { GameService } from '@app/services/game/game.service';
import { GridService } from '@app/services/grid/grid.service';
import { MouseHandlingService } from '@app/services/mouse-handling/mouse-handling.service';
import { PlaceLetterService } from '@app/services/place-letter/place-letter.service';
import { RackService } from '@app/services/rack/rack.service';
import FontFaceObserver from 'fontfaceobserver';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnDestroy, AfterViewInit {
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('squareCanvas', { static: false }) private squareCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('tempCanvas', { static: false }) private tempCanvas!: ElementRef<HTMLCanvasElement>;

    isLetter: boolean;
    isMouseOnBoard: boolean;
    isUpper: boolean;
    letter: string;
    squareSelected: boolean;

    private gridContext: CanvasRenderingContext2D;
    private squareContext: CanvasRenderingContext2D;
    private tempContext: CanvasRenderingContext2D;

    private boardSubscription: Subscription;

    constructor(
        readonly gridService: GridService,
        readonly mouseHandlingService: MouseHandlingService,
        private readonly rackService: RackService,
        private readonly boardService: BoardService,
        private readonly gameService: GameService,
        readonly placeLetterService: PlaceLetterService,
    ) {
        this.squareSelected = false;
    }

    @HostListener('body:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (this.placeLetterService.gridPosition === undefined) {
            return;
        }

        const backSpaceValid: boolean =
            this.placeLetterService.backSpaceEnable(event.key, this.squareSelected) &&
            !this.placeLetterService.isPositionInit(this.placeLetterService.gridPosition) &&
            this.placeLetterService.inGrid(this.placeLetterService.gridPosition);
        const enterValid: boolean = event.key === 'Enter' && this.placeLetterService.tempRack.length > 0;
        const lastSquare =
            this.placeLetterService.gridPosition.x > Constants.GRID.GRID_SIZE || this.placeLetterService.gridPosition.y > Constants.GRID.GRID_SIZE;

        if (backSpaceValid) {
            this.placeLetterService.backSpaceOperation(this.tempContext);
            this.gridService.drawBonusOfPosition(this.squareContext, this.placeLetterService.gridPosition);
            this.placeLetterService.isLastSquare = false;
        } else if (event.key === 'Escape') {
            this.resetPlaceSelection();
        } else if (enterValid) {
            this.play();
        } else {
            this.handleKeyPress(event.key);
            const validKey: boolean = this.squareSelected && this.isLetter && this.placeLetterService.inGrid(this.placeLetterService.gridPosition);

            if (validKey && !lastSquare) {
                this.handleKeyDown(lastSquare);
            }
        }
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseHandlingService.mouseHitDetect(event);
        this.resetPlaceSelection();

        this.mouseHandlingService.mouseHitDetect(event);
        const canClick = this.placeLetterService.myRack.length === 0 && this.gameService.currentTurn === PlayerType.Local;
        if (canClick) {
            this.mouseHandlingService.mouseHitDetect(event);

            if (this.placeLetterService.gridPosition === undefined) {
                this.placeLetterService.gridPosition = this.mouseHandlingService.position;
                this.placeLetterService.positionInit = { x: this.placeLetterService.gridPosition.x, y: this.placeLetterService.gridPosition.y };
                this.gridService.resetCanvas(this.tempContext);
            } else {
                this.placeLetterService.samePosition(this.mouseHandlingService.position);
                this.gridService.resetCanvas(this.tempContext);
                this.gridService.drawSquares(this.squareContext);
            }

            const squareValid: boolean =
                this.placeLetterService.inGrid(this.placeLetterService.gridPosition) &&
                this.boardService.isPositionAvailable(this.placeLetterService.gridPosition);

            if (squareValid) {
                this.gridService.cleanInsideSquare(this.squareContext, this.placeLetterService.gridPosition);
                this.gridService.drawSelectionSquare(this.tempContext, this.placeLetterService.gridPosition);

                const lastSquare =
                    (this.placeLetterService.gridPosition.x === Constants.GRID.GRID_SIZE && this.placeLetterService.isHorizontal) ||
                    (this.placeLetterService.gridPosition.y === Constants.GRID.GRID_SIZE && !this.placeLetterService.isHorizontal);

                if (!lastSquare) {
                    this.gridService.drawDirectionArrow(this.tempContext, this.placeLetterService.gridPosition, this.placeLetterService.isHorizontal);
                }

                this.squareSelected = true;
            }
            return;
        }
        this.gridService.resetCanvas(this.tempContext);
    }

    ngAfterViewInit(): void {
        this.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.squareContext = this.squareCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.tempContext = this.tempCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        this.boardSubscription = this.boardService.boardUpdated.subscribe(() => this.refresh());

        this.scale();

        new FontFaceObserver(this.gridService.letterFontFace.font).load().then(() => {
            this.gridService.drawGrid(this.gridContext);
            this.gridService.drawSquares(this.squareContext);
            this.squareCanvas.nativeElement.focus();
        });
    }

    ngOnDestroy(): void {
        this.boardSubscription?.unsubscribe();
    }

    updateFontSize(size: number): void {
        this.gridService.letterFontFace.size = size;
        this.gridService.drawGrid(this.gridContext);
        this.gridService.drawSquares(this.squareContext);
    }

    play(): void {
        this.placeLetterService.placeLetters();
        this.gridService.resetCanvas(this.tempContext);
    }

    lostFocus(): void {
        if (this.isMouseOnBoard) {
            return;
        }

        this.resetPlaceSelection();
    }

    get width(): number {
        return Constants.GRID.CANVAS_SIZE.x;
    }

    get height(): number {
        return Constants.GRID.CANVAS_SIZE.y;
    }

    private refresh(): void {
        this.gridService.resetCanvas(this.tempContext);

        // TODO This only needs to be done once per game
        this.gridService.drawGrid(this.gridContext);

        this.gridService.drawSquares(this.squareContext);
        this.placeLetterService.myRack = [];
        this.placeLetterService.tempRack = [];
    }

    private scale(): void {
        const gridCanvas = this.gridCanvas.nativeElement;
        const squareCanvas = this.squareCanvas.nativeElement;
        const scaleFactor = window.devicePixelRatio;

        squareCanvas.width = gridCanvas.width = Math.ceil(gridCanvas.width * scaleFactor);
        squareCanvas.height = gridCanvas.height = Math.ceil(gridCanvas.height * scaleFactor);
        this.gridContext.scale(scaleFactor, scaleFactor);
        this.squareContext.scale(scaleFactor, scaleFactor);
    }

    private handleKeyPress(key: string): void {
        const input = SPECIAL_CHARACTERS.get(key);

        if (input === undefined) {
            if (key.length !== 1 || !key.match('([a-zA-Z])')) {
                this.isLetter = false;
                return;
            }
            this.handleSpecialCharacter(key);
            return;
        }
        this.handleSpecialCharacter(input);
    }

    private handleSpecialCharacter(key: string): void {
        if (key === key.toUpperCase()) {
            if (this.rackService.rack.includes('*')) {
                this.isLetter = true;
                this.letter = key;
                this.isUpper = true;
                return;
            }
            this.isLetter = false;
            return;
        }
        if (this.rackService.rack.includes(key)) {
            this.isLetter = true;
            this.letter = key;
            this.isUpper = false;
            return;
        }
        this.isLetter = false;
        return;
    }

    private resetPlaceSelection(): void {
        this.placeLetterService.escapeOperation(this.tempContext);
        this.placeLetterService.isLastSquare = false;
        this.gridService.drawSquares(this.squareContext);
        this.squareSelected = false;
        this.placeLetterService.isHorizontal = true;
    }

    private handleKeyDown(lastSquare: boolean): void {
        this.gridService.cleanInsideSquare(this.tempContext, this.placeLetterService.gridPosition);
        this.gridService.cleanInsideSquare(this.squareContext, this.placeLetterService.gridPosition);
        this.gridService.drawSymbol(this.letter.toUpperCase(), this.placeLetterService.gridPosition, this.tempContext);

        if (this.isUpper) {
            this.rackService.rack.splice(this.rackService.indexOf('*'), 1);
            this.placeLetterService.tempRack.push(this.letter);
            this.placeLetterService.myRack.push('*');
        } else {
            this.rackService.rack.splice(this.rackService.indexOf(this.letter), 1);
            this.placeLetterService.tempRack.push(this.letter);
            this.placeLetterService.myRack.push(this.letter);
        }

        if (
            this.placeLetterService.gridPosition.x === Constants.GRID.GRID_SIZE - 1 ||
            this.placeLetterService.gridPosition.y === Constants.GRID.GRID_SIZE - 1
        ) {
            this.placeLetterService.isLastSquare = true;
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
