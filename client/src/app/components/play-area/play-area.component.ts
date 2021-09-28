import FontFaceObserver from 'fontfaceobserver';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { PlayerType } from '@app/classes/player-type';
import { Constants } from '@app/constants/global.constants';
import { GridService } from '@app/services/grid/grid.service';
import { MouseHandlingService } from '@app/services/mouse-handling/mouse-handling.service';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, OnChanges {
    @Input() playerType: PlayerType;

    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('squareCanvas', { static: false }) private squareCanvas!: ElementRef<HTMLCanvasElement>;

    private gridContext: CanvasRenderingContext2D;
    private squareContext: CanvasRenderingContext2D;

    constructor(readonly gridService: GridService, readonly mouseHandlingService: MouseHandlingService) {}

    ngAfterViewInit(): void {
        this.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.squareContext = this.squareCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

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

    updateFontSize(size: number) {
        this.gridService.letterFontFace.size = size;
        this.gridService.drawGrid(this.gridContext);
        this.gridService.drawSquares(this.squareContext);
    }
}
