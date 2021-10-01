/* eslint-disable max-classes-per-file -- Class is implemented for testing purposes only relevant ro this service*/

import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Board, ImmutableBoard } from '@app/classes/board/board';
import { Bonus } from '@app/classes/board/bonus';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';
import { GridService } from '@app/services/grid/grid.service';

const BOARD: Board = new Board(Constants.GRID.GRID_SIZE, [
    [{ x: 0, y: 0 }, Bonus.L2],
    [{ x: 0, y: 1 }, Bonus.L3],
    [{ x: 0, y: 2 }, Bonus.W2],
    [{ x: 0, y: 3 }, Bonus.W3],
]);

@Injectable({
    providedIn: 'root',
})
class BoardServiceStub {
    get gameBoard(): ImmutableBoard {
        return BOARD;
    }
}

describe('GridService', () => {
    let service: GridService;
    let ctxStub: CanvasRenderingContext2D;

    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;

    BOARD.merge([{ letter: 's', position: { x: 4, y: 4 } }]);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: BoardService, useClass: BoardServiceStub }],
        });
        service = TestBed.inject(GridService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' width should return the width of the grid canvas', () => {
        expect(service.width).toEqual(Constants.GRID.CANVAS_SIZE.x);
    });

    it(' height should return the height of the grid canvas', () => {
        expect(service.width).toEqual(Constants.GRID.CANVAS_SIZE.y);
    });

    it(' drawLetter should call fillText on the canvas', () => {
        const fillTextSpy = spyOn(ctxStub, 'fillText').and.callThrough();
        service.drawSymbol('t', { x: 0, y: 0 }, ctxStub);
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it(' drawLetter should not call fillText if word is empty', () => {
        const fillTextSpy = spyOn(ctxStub, 'fillText').and.callThrough();
        service.drawSymbol('', { x: 0, y: 0 }, ctxStub);
        expect(fillTextSpy).toHaveBeenCalledTimes(0);
    });

    it(' drawLetter should color pixels on the canvas', () => {
        let imageData = ctxStub.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawSymbol('t', { x: 0, y: 0 }, ctxStub);
        imageData = ctxStub.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it(' drawGrid should call moveTo and lineTo 32 times', () => {
        const expectedCallTimes = 32;
        const moveToSpy = spyOn(ctxStub, 'moveTo').and.callThrough();
        const lineToSpy = spyOn(ctxStub, 'lineTo').and.callThrough();
        service.drawGrid(ctxStub);
        expect(moveToSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(lineToSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it(' drawGrid should color pixels on the canvas', () => {
        let imageData = ctxStub.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawGrid(ctxStub);
        imageData = ctxStub.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it(' drawSquares should call drawImage and drawSymbol once', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Needed for spy
        const spyImage = spyOn<any>(service, 'drawImage');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Needed for spy
        const spySymbol = spyOn<any>(service, 'drawSymbol');
        service.drawSquares(ctxStub);
        expect(spyImage).toHaveBeenCalledTimes(1);
        expect(spySymbol).toHaveBeenCalledTimes(1);
    });

    it(' drawSquares should be called 4 times', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Needed for spy
        const spy = spyOn<any>(service, 'drawBonus');
        const timesCalled = 4;
        service.drawSquares(ctxStub);
        expect(spy).toHaveBeenCalledTimes(timesCalled);
    });
});
