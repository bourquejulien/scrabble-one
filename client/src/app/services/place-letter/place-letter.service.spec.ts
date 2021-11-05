/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BoardService } from '@app/services/board/board.service';
import { GridService } from '@app/services/grid/grid.service';
import { PlayerService } from '@app/services/player/player.service';
import { RackService } from '@app/services/rack/rack.service';
import { Direction } from '@common';
import { PlaceLetterService } from './place-letter.service';

class BoardServiceMock {
    iteration = 0;
    positionIsAvailable() {
        if (this.iteration < 1) {
            this.iteration++;
            return false;
        }
        this.iteration = 0;
        return true;
    }

    getLetter() {
        return 'a';
    }
}

describe('PlaceLetterService', () => {
    let service: PlaceLetterService;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let gridServiceSpy: jasmine.SpyObj<GridService>;

    let rackServiceSpy: jasmine.SpyObj<RackService>;
    let ctxStub: CanvasRenderingContext2D;
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;
    beforeEach(() => {
        const mockMyRack = ['e', 's', 't'];
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['placeLetters']);
        gridServiceSpy = jasmine.createSpyObj('GridService', [
            'clearSquare',
            'cleanInsideSquare',
            'drawSelectionSquare',
            'drawDirectionArrow',
            'resetCanvas',
        ]);
        // boardServiceSpy = jasmine.createSpyObj('BoardService', ['positionIsAvailable', 'getLetter']);
        rackServiceSpy = jasmine.createSpyObj('RackService', [], { rack: mockMyRack });
        TestBed.configureTestingModule({
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: GridService, useValue: gridServiceSpy },
                { provide: RackService, useValue: rackServiceSpy },
                { provide: BoardService, useClass: BoardServiceMock },
            ],
        });
        service = TestBed.inject(PlaceLetterService);
        service.myRack = mockMyRack;
        service.tempRack = mockMyRack;
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear myRack and tempRack when enterOperation() is called', () => {
        service.isHorizontal = true;
        service.positionInit = { x: 8, y: 8 };
        service.enterOperation();

        expect(service.myRack).toEqual([]);
        expect(service.tempRack).toEqual([]);
    });

    it('should create the right word when enterOperation() is called', () => {
        service.isHorizontal = true;
        service.positionInit = { x: 8, y: 8 };
        service.enterOperation();

        expect(playerServiceSpy.placeLetters).toHaveBeenCalledWith('est', { x: 7, y: 7 }, Direction.Right);
    });

    it('should called placeletter in the right direction when enterOperation() is called', () => {
        service.isHorizontal = false;
        service.positionInit = { x: 8, y: 8 };
        service.enterOperation();

        expect(playerServiceSpy.placeLetters).toHaveBeenCalledWith('est', { x: 7, y: 7 }, Direction.Down);
    });

    it('should called clearSquare when backSpaceOperation() is called', () => {
        service.isHorizontal = true;
        service.gridPosition = { x: 8, y: 8 };

        service.backSpaceOperation(ctxStub);
        expect(gridServiceSpy.clearSquare).toHaveBeenCalledWith(ctxStub, service.gridPosition);
    });

    it('should called clearSquare when backSpaceOperation() is called', () => {
        const expectedPosition = { x: 8, y: 15 };
        service.isHorizontal = false;
        service.gridPosition = { x: 8, y: 16 };

        service.backSpaceOperation(ctxStub);
        expect(gridServiceSpy.drawSelectionSquare).toHaveBeenCalledWith(ctxStub, expectedPosition);
    });

    it('should called resetCanvas and cancel when escapeOperation() is called', () => {
        service.positionInit = { x: 8, y: 8 };
        const spy = spyOn<any>(service, 'cancel');
        service.escapeOperation(ctxStub);

        expect(gridServiceSpy.resetCanvas).toHaveBeenCalledWith(ctxStub);
        expect(spy).toHaveBeenCalled();
    });

    it('should return true when isPostionInit is called', () => {
        service.positionInit = { x: 8, y: 8 };
        service.gridPosition = { x: 8, y: 8 };

        expect(service.isPositionInit(service.gridPosition)).toBeTrue();
    });

    it('should return false when isPostionInit is called', () => {
        service.positionInit = { x: 8, y: 8 };
        service.gridPosition = { x: 9, y: 9 };

        expect(service.isPositionInit(service.gridPosition)).toBeFalse();
    });

    it('should true when backSpaceEnable is called', () => {
        const key = 'Backspace';
        const squareSelected = true;

        expect(service.backSpaceEnable(key, squareSelected)).toBeTrue();
    });

    it('should false when backSpaceEnable is called', () => {
        const key = 'Backspace';
        const squareSelected = false;

        expect(service.backSpaceEnable(key, squareSelected)).toBeFalse();
    });

    it('should set isHorizontal to false when samePosition is called', () => {
        const position = { x: 8, y: 8 };
        service.gridPosition = { x: 8, y: 8 };
        service.samePosition(position);

        expect(service.isHorizontal).toBeFalse();
    });

    it('should set correct attribute when not samePosition is called', () => {
        const position = { x: 8, y: 8 };
        service.gridPosition = { x: 9, y: 9 };
        service.samePosition(position);

        expect(service.myRack).toEqual([]);
        expect(service.gridPosition).toEqual(position);
        expect(service.positionInit).toEqual(position);
        expect(service.isHorizontal).toBeTrue();
    });

    it('should return true when inGrid is called', () => {
        const position = { x: 8, y: 8 };

        expect(service.inGrid(position)).toBeTrue();
    });

    it('should return false when inGrid is called', () => {
        const position = { x: 17, y: 8 };

        expect(service.inGrid(position)).toBeFalse();
    });

    it('should return false when inGrid is called', () => {
        const position = { x: 1, y: -8 };

        expect(service.inGrid(position)).toBeFalse();
    });

    it('should call cancel when samePosition is called', () => {
        const position = { x: 8, y: 8 };
        service.gridPosition = { x: 9, y: 9 };
        service.samePosition(position);

        expect(service.tempRack).toEqual([]);
    });

    it('should call getNextSquare when nextAvailableSquare is called', () => {
        const isForward = true;
        const expecterRack = ['e', 's', 't', 'a'];
        const expectedPosition = { x: 9, y: 8 };
        service.gridPosition = { x: 8, y: 8 };
        service.nextAvailableSquare(isForward);

        expect(service.tempRack).toEqual(expecterRack);
        expect(service.gridPosition).toEqual(expectedPosition);
    });

    it('should call getPastSquare when nextAvailableSquare is called', () => {
        const isForward = false;
        const expectedRack = ['e', 's'];
        const expectedPosition = { x: 7, y: 8 };
        service.gridPosition = { x: 8, y: 8 };
        service.nextAvailableSquare(isForward);

        expect(service.tempRack).toEqual(expectedRack);
        expect(service.gridPosition).toEqual(expectedPosition);
    });

    it('should call getNextSquare vertical when nextAvailableSquare is called', () => {
        const isForward = true;
        service.isHorizontal = false;
        const expectedPosition = { x: 8, y: 9 };
        service.gridPosition = { x: 8, y: 8 };
        service.nextAvailableSquare(isForward);

        expect(service.gridPosition).toEqual(expectedPosition);
    });

    it('should set isLastSquareto true if maxSize when nextAvailableSquare is called', () => {
        const isForward = true;
        service.gridPosition = { x: 15, y: 8 };
        service.nextAvailableSquare(isForward);

        expect(service.isLastSquare).toBeTrue();
    });

    it('should call getPastSquare vertical when nextAvailableSquare is called', () => {
        const isForward = false;
        service.isHorizontal = false;
        const expectedPosition = { x: 8, y: 7 };
        service.gridPosition = { x: 8, y: 8 };
        service.nextAvailableSquare(isForward);

        expect(service.gridPosition).toEqual(expectedPosition);
    });

    it('should call getNext horizontal when nextAvailableSquare true is called', () => {
        spyOn<any>(service.boardService, 'positionIsAvailable').and.returnValue(true);
        const isForward = true;
        service.isHorizontal = true;
        const expectedPosition = { x: 17, y: 8 };
        service.gridPosition = { x: 16, y: 8 };
        service.nextAvailableSquare(isForward);

        expect(service.gridPosition).toEqual(expectedPosition);
    });

    it('should call getPastSquare horizontal when nextAvailableSquare false is called', () => {
        spyOn<any>(service.boardService, 'positionIsAvailable').and.returnValue(true);
        const isForward = false;
        service.isHorizontal = true;
        const expectedPosition = { x: 15, y: 8 };
        service.gridPosition = { x: 16, y: 8 };
        service.nextAvailableSquare(isForward);

        expect(service.gridPosition).toEqual(expectedPosition);
    });
});
