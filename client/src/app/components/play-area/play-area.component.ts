import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { PlayerType } from '@app/classes/player-type';
import { Timer } from '@app/classes/timer';
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

    timer1 = new Timer(2, 0);
    timer2 = new Timer(1, 30);

    private gridContext: CanvasRenderingContext2D;
    private squareContext: CanvasRenderingContext2D;

    constructor(private readonly gridService: GridService, readonly mouseHandlingService: MouseHandlingService) {
        this.timer1.timerInstance.subscribe(() => { this.timer1.getTimerCountdown(this.timer1) });
        this.timer1.stopTimer();

        this.timer2.timerInstance.subscribe(() => { this.timer2.getTimerCountdown(this.timer2) });
        this.timer2.stopTimer();
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
        if (!changes.playerType.isFirstChange && changes.playerType.currentValue !== changes.playerType.previousValue) {
            this.gridService.drawSquares(this.squareContext);
        }
    }

    get width(): number {
        return Constants.grid.CANVAS_SIZE.x;
    }

    get height(): number {
        return Constants.grid.CANVAS_SIZE.y;
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

    startTimer1(): void {
        //this.timer1.initTimerLimits(3, 0);
        this.timer1.startTimer();
    }

    stopTimer1(): void {
        this.timer1.stopTimer();
    }

    startTimer2(): void {
        //this.timer2.initTimerLimits(1, 30);
        this.timer2.startTimer();
    }

    stopTimer2(): void {
        this.timer2.stopTimer();
    }
}
