import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/constants/global.constants';
import { GridService } from '@app/services/grid/grid.service';

import { MouseHandlingService } from './mouse-handling.service';

class GridServiceStub {
    get width(): number {
        return Constants.grid.CANVAS_SIZE.x;
    }

    get height(): number {
        return Constants.grid.CANVAS_SIZE.y;
    }

    get boardGridSize(): number {
        return Constants.grid.GRID_SIZE;
    }
}

describe('MouseHandlingService', () => {
    let service: MouseHandlingService;
    let gridService: GridService;
    let mouseEvent: MouseEvent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: GridService, useClass: GridServiceStub }],
        });
        service = TestBed.inject(MouseHandlingService);
        gridService = TestBed.inject(GridService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('mouseHitDetect should assign the mouse position to mousePosition variable', () => {
        const expectedPosition: Vec2 = { x: gridService.boardGridSize, y: gridService.boardGridSize };
        mouseEvent = {
            offsetX: gridService.height,
            offsetY: gridService.width,
            button: 0,
        } as MouseEvent;
        service.mouseHitDetect(mouseEvent);
        expect(service.position).toEqual(expectedPosition);
    });

    it('mouseHitDetect should not change the mouse position if it is not a left click', () => {
        const increment = 200;
        const expectedPosition: Vec2 = { x: -1, y: -1 };
        mouseEvent = {
            offsetX: expectedPosition.x + increment,
            offsetY: expectedPosition.y + increment,
            button: 1,
        } as MouseEvent;
        service.mouseHitDetect(mouseEvent);
        expect(service.position).not.toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
        expect(service.position).toEqual(expectedPosition);
    });
});
