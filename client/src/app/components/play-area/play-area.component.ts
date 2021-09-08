import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { GridService } from '@app/services/grid.service';

// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 500;
export const DEFAULT_HEIGHT = 500;
export const DEFAULT_GRID_SIZE = 15;

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
export class PlayAreaComponent implements AfterViewInit {
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;

    mousePosition: Vec2 = { x: 0, y: 0 };
    gridPosition: Vec2 = { x: -1, y: -1 };
    buttonPressed = '';
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    private gridSize = DEFAULT_GRID_SIZE;

    constructor(private readonly gridService: GridService) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;

        if (this.gridPosition.x >= 0 || this.gridPosition.y >= 0) {
            this.gridService.drawLetter(event.key, {x: this.gridPosition.x, y: this.gridPosition.y});
        }
    }

    ngAfterViewInit(): void {
        this.gridService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        let canvas = this.gridCanvas.nativeElement;
        let scaleFactor = window.devicePixelRatio;
        
        canvas.style.width = canvas.style.width || canvas.width + 'px';
        canvas.style.height = canvas.style.height || canvas.height + 'px';

        canvas.width = Math.ceil(canvas.width * scaleFactor);
        canvas.height = Math.ceil(canvas.height * scaleFactor);
        let ctx = canvas.getContext('2d');
        ctx?.scale(scaleFactor, scaleFactor);

        this.gridService.drawGrid();
        this.gridCanvas.nativeElement.focus();
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
            let position: Vec2 = { x: event.offsetX, y: event.offsetY };

            this.mousePosition = position;
            this.refreshGridPositon(position);
        }
    }

    private refreshGridPositon = (position: Vec2) => this.gridPosition = { x: this.computeGridPosition(position.x), y: this.computeGridPosition(position.y) };

    private computeGridPosition = (position: number): number => Math.floor((position / this.width) * this.gridSize);
}
