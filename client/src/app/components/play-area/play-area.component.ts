import { AfterViewInit, Component, ElementRef, HostListener, ViewChild, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/constants/global.constants';
import { GridService } from '@app/services/grid.service';

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, OnChanges {
    @Input() selectedPlayer: string;

    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('squareCanvas', { static: false }) private squareCanvas!: ElementRef<HTMLCanvasElement>;

    mousePosition: Vec2 = { x: 0, y: 0 };
    gridPosition: Vec2 = { x: -1, y: -1 };
    buttonPressed = '';

    private gridContext: CanvasRenderingContext2D;
    private squareContext: CanvasRenderingContext2D;

    private readonly canvasSize = Constants.grid.CANVAS_SIZE;
    private readonly gridSize = Constants.grid.GRID_SIZE;

    constructor(private readonly gridService: GridService) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;

        // if (this.gridPosition.x >= 1 && this.gridPosition.y >= 1) {
        //     this.gridService.drawSymbol(event.key, { x: this.gridPosition.x, y: this.gridPosition.y });
        // }
    }

    ngAfterViewInit(): void {
        this.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.squareContext = this.squareCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        this.scale();

        this.gridService.drawGrid(this.gridContext);
        this.gridService.drawSquares(this.squareContext);
        this.squareCanvas.nativeElement.focus();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes.selectedPlayer.isFirstChange && changes.selectedPlayer.currentValue !== changes.selectedPlayer.previousValue) {
            this.gridService.drawSquares(this.squareContext);
        }
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

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    // TODO : déplacer ceci dans un service de gestion de la souris!
    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            const position: Vec2 = { x: event.offsetX, y: event.offsetY };

            this.mousePosition = position;
            this.refreshGridPosition(position);
        }
    }

    private refreshGridPosition(position: Vec2) {
        this.gridPosition = { x: this.computeGridPosition(position.x), y: this.computeGridPosition(position.y) };
    }

    private computeGridPosition(position: number): number {
        return Math.floor((position / this.width) * (this.gridSize + 1));
    }
}
