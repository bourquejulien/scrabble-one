import { Injectable } from '@angular/core';
import { Vec2 } from '@common';
import { GridService } from '@app/services/grid/grid.service';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Injectable({
    providedIn: 'root',
})
export class MouseHandlingService {
    private gridPosition: Vec2;

    constructor(private readonly gridService: GridService) {
        this.gridPosition = { x: -1, y: -1 };
    }

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            const position: Vec2 = { x: event.offsetX, y: event.offsetY };

            this.refreshGridPosition(position);
        }
    }

    get position(): Vec2 {
        return this.gridPosition;
    }

    private refreshGridPosition(position: Vec2) {
        this.gridPosition = { x: this.computeGridPosition(position.x), y: this.computeGridPosition(position.y) };
    }

    private computeGridPosition(position: number): number {
        return Math.floor((position / this.gridService.width) * this.gridService.boardGridSize);
    }
}
