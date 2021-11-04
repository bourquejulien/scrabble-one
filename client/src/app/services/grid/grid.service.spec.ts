/* eslint-disable max-classes-per-file -- Class is implemented for testing purposes only relevant ro this service*/
/* eslint-disable dot-notation -- Need access to private functions and properties*/
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';
import { GridService } from '@app/services/grid/grid.service';
import { BoardData, Bonus } from '@common';

const BONUSES = [
    { bonus: Bonus.L2, position: { x: 0, y: 0 } },
    { bonus: Bonus.L3, position: { x: 0, y: 1 } },
    { bonus: Bonus.W2, position: { x: 0, y: 2 } },
    { bonus: Bonus.W3, position: { x: 0, y: 3 } },
    { bonus: Bonus.Star, position: { x: 7, y: 7 } },
];

const generateData = (size: number): BoardData => {
    const data: BoardData = { board: [], filledPositions: [] };

    for (let x = 0; x < size; x++) {
        data.board[x] = [];
        for (let y = 0; y < size; y++) {
            const bonus = BONUSES.find((e) => e.position.x === x && e.position.y === y)?.bonus ?? Bonus.None;
            data.board[x][y] = { position: { x, y }, letter: bonus === Bonus.None ? 'a' : '', bonus };
        }
    }

    return data;
};

@Injectable({
    providedIn: 'root',
})
class BoardServiceStub {
    constructor(private readonly boardData: BoardData) {}
    get gameBoard(): BoardData {
        return this.boardData;
    }
}

fdescribe('GridService', () => {
    let service: GridService;
    let ctxStub: CanvasRenderingContext2D;

    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: BoardService, useValue: new BoardServiceStub(generateData(Constants.GRID.GRID_SIZE)) },
            ],
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
        service['drawSymbol']('t', { x: 0, y: 0 }, ctxStub);
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it(' drawLetter should not call fillText if word is empty', () => {
        const fillTextSpy = spyOn(ctxStub, 'fillText').and.callThrough();
        service['drawSymbol']('', { x: 0, y: 0 }, ctxStub);
        expect(fillTextSpy).toHaveBeenCalledTimes(0);
    });

    it(' drawLetter should color pixels on the canvas', () => {
        let imageData = ctxStub.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service['drawSymbol']('t', { x: 0, y: 0 }, ctxStub);
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

    it(' drawSquares should call drawImage and drawSymbol', () => {
        const TIMES_SYMBOL_CALLED = 220;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Needed for spyOn service
        const spyImage = spyOn<any>(service, 'drawImage');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Needed for spyOn service
        const spySymbol = spyOn<any>(service, 'drawSymbol');

        service.drawSquares(ctxStub);
        expect(spyImage).toHaveBeenCalledTimes(1);
        expect(spySymbol).toHaveBeenCalledTimes(TIMES_SYMBOL_CALLED);
    });

    it(' drawBonus should be called 4 times', () => {
        const TIMES_CALLED = 5;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Needed for spyOn service
        const spy = spyOn<any>(service, 'drawBonus');
        service.drawSquares(ctxStub);
        expect(spy).toHaveBeenCalledTimes(TIMES_CALLED);
    });

    it('should not draw a bonus symbol if no bonus provided', () => {
        const spy = spyOn<any>(service, 'fitTextSize');
        service['drawBonus'](Bonus.None, { x: 0, y: 0 }, ctxStub);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should call fillSquare with the correct arguments', () => {
        const spy = spyOn<any>(service, 'fillSquare');
        service.drawGrid(ctxStub);
        expect(spy).toHaveBeenCalled();
    });

    it('should draw a bonus on grid if bonus provided', () => {
        const spy = spyOn<any>(Map.prototype, 'get');
        service.drawGrid(ctxStub);
        expect(spy).toHaveBeenCalled();
    });

    it('should draw a symbol if bonus provided', () => {
        service['boardService']['boardData'].board[0][0].letter = '';
        service['boardService']['boardData'].board[0][0].bonus = Bonus.Star;
        const spy = spyOn<any>(service, 'drawBonus');
        service.drawSquares(ctxStub);
        expect(spy).toHaveBeenCalled();
    });

    it('should draw image if image provided', () => {
        service['playGridSize'] = 4;
        const spy = spyOn<any>(service, 'drawImage');
        service['boardService']['boardData'].board[2][2].letter = '';
        service.drawSquares(ctxStub);
        expect(spy).toHaveBeenCalled();
    });

    it('should not draw star image if center not empty', () => {
        service['playGridSize'] = 4;
        const spy = spyOn<any>(service, 'drawImage');
        service['boardService']['boardData'].board[2][2].letter = 'b';
        service.drawSquares(ctxStub);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should call draw image if image not complete', () => {
        let img = new Image;
        const spy = spyOn(ctxStub, 'drawImage');
        service['drawImage'](img, { x: 0, y: 0 }, ctxStub);
        service.drawSquares(ctxStub);
        expect(spy).toHaveBeenCalled();
    });
});
