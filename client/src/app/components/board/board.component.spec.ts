/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayerType } from '@app/classes/player/player-type';
import { Constants } from '@app/constants/global.constants';
import { AppMaterialModule } from '@app/modules/material.module';
import { BoardService } from '@app/services/board/board.service';
import { GameService } from '@app/services/game/game.service';
import { GridService } from '@app/services/grid/grid.service';
import { PlaceLetterService } from '@app/services/place-letter/place-letter.service';
import { RackService } from '@app/services/rack/rack.service';
import { Vec2 } from '@common';
import { BoardComponent } from './board.component';

class GridServiceStub {
    letterFontFace = { font: '', size: 0 };

    isDrawGridCalled = false;
    isDrawSquareCalled = false;
    isResetCanvasCalled = false;
    cleanInsideSquareCalled: boolean;
    drawDirectionArrowCalled: boolean;
    drawBonusOfPositionCalled: boolean;
    drawSymbolCalled: boolean;

    // eslint-disable-next-line no-unused-vars -- Its a stub, implemented to do nothing
    drawGrid(canvas: CanvasRenderingContext2D): void {
        this.isDrawGridCalled = true;
    }

    // eslint-disable-next-line no-unused-vars -- Its a stub, implemented to do nothing
    drawSquares(canvas: CanvasRenderingContext2D): void {
        this.isDrawSquareCalled = true;
    }

    // eslint-disable-next-line no-unused-vars -- Its a stub, implemented to do nothing
    resetCanvas(canvas: CanvasRenderingContext2D): void {
        this.isResetCanvasCalled = true;
    }

    // eslint-disable-next-line no-unused-vars -- Its a stub, implemented to do nothing
    drawSelectionSquare(tempContext: CanvasRenderingContext2D, position: Vec2) {
        return true;
    }

    // eslint-disable-next-line no-unused-vars -- Its a stub, implemented to do nothing
    cleanInsideSquare(tempContext: CanvasRenderingContext2D, position: Vec2): void {
        this.cleanInsideSquareCalled = true;
    }
    // eslint-disable-next-line no-unused-vars -- Its a stub, implemented to do nothing
    drawDirectionArrow(tempContext: CanvasRenderingContext2D, position: Vec2, direction: boolean): void {
        this.drawDirectionArrowCalled = true;
    }

    // eslint-disable-next-line no-unused-vars -- Its a stub, implemented to do nothing
    drawBonusOfPosition(squareContext: CanvasRenderingContext2D, position: Vec2): void {
        this.drawBonusOfPositionCalled = true;
    }

    // eslint-disable-next-line no-unused-vars -- Its a stub, implemented to do nothing
    drawSymbol(letter: string, gridPosition: Vec2, context: CanvasRenderingContext2D) {
        this.drawSymbolCalled = true;
    }
}

// @Injectable({
//     providedIn: 'root',
// })
// class PlaceLetterServiceMock {
//     inGridResult: boolean;
//     isInit: boolean;
//     gridPosition: Vec2 | undefined = undefined;
//     isLastSquare = false;
//     tempRack = ['e', 's', 't'];
//     myRack = [];
//     positionInit = { x: 7, y: 8 };
//     isHorizontal = true;

//     samePosition(): void {
//         this.myRack = [];
//     }

//     inGrid(): boolean {
//         return true;
//     }

//     backSpaceOperation(): void {
//         this.tempRack.pop();
//         this.myRack.pop();
//     }

//     escapeOperation(): void {
//         this.gridPosition = this.positionInit;
//     }

//     nextAvailableSquare(): void {
//         this.gridPosition = { x: 9, y: 8 };
//     }

//     enterOperation(): void {
//         this.myRack = [];
//         this.tempRack = [];
//     }

//     backSpaceEnable(): boolean {
//         return true;
//     }

//     isPositionInit(): boolean {
//         return this.isInit;
//     }
// }

class BoardServiceMock {
    iteration = 0;
    positionIsAvailable() {
        return true;
    }

    getLetter() {
        return 'a';
    }
}

fdescribe('BoardComponent', () => {
    const playerType = PlayerType.Local;
    let component: BoardComponent;
    let fixture: ComponentFixture<BoardComponent>;
    let gridServiceStub: GridServiceStub;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let rackServiceSpy: jasmine.SpyObj<RackService>;

    let placeLetter: jasmine.SpyObj<PlaceLetterService>;

    beforeEach(async () => {
        const mockMyRack = ['e', 's', 't', '*', 'a', 'b', 'c'];
        rackServiceSpy = jasmine.createSpyObj('RackService', ['indexOf'], { rack: mockMyRack });
        gameServiceSpy = jasmine.createSpyObj('GameService', [], { currentTurn: playerType });
        placeLetter = jasmine.createSpyObj('PlaceLetterService', [
            'enterOperation',
            'inGrid',
            'isPositionInit',
            'backSpaceEnable',
            'escapeOperation',
            'samePosition',
            'backSpaceOperation',
            'nextAvailableSquare',
        ]);

        placeLetter.inGrid.and.returnValue(true);
        placeLetter.isPositionInit.and.returnValue(true);
        placeLetter.tempRack = ['e', 's', 't'];
        placeLetter.isLastSquare = false;
        placeLetter.myRack = [];
        placeLetter.positionInit = { x: 7, y: 8 };
        placeLetter.isHorizontal = true;
        await TestBed.configureTestingModule({
            declarations: [BoardComponent],
            providers: [
                { provide: GridService, useClass: GridServiceStub },
                { provide: BoardService, useClass: BoardServiceMock },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: PlaceLetterService, useValue: placeLetter },
                { provide: RackService, useValue: rackServiceSpy },
                { provide: HttpClient, useClass: HttpClient },
                HttpHandler,
            ],
            imports: [AppMaterialModule, CommonModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BoardComponent);
        gridServiceStub = TestBed.inject(GridService) as unknown as GridServiceStub;
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return correct width', () => {
        expect(component.width).toEqual(Constants.GRID.CANVAS_SIZE.x);
    });

    it('should return correct height', () => {
        expect(component.height).toEqual(Constants.GRID.CANVAS_SIZE.y);
    });

    it('should update font size if size provided', () => {
        const NEW_SIZE = 17;

        component.updateFontSize(NEW_SIZE);

        expect(gridServiceStub.letterFontFace.size).toEqual(NEW_SIZE);
        expect(gridServiceStub.isDrawSquareCalled).toBeTrue();
        expect(gridServiceStub.isDrawGridCalled).toBeTrue();
    });

    it('should resetCanvas and enterOperation when play', () => {
        const spyReset = spyOn(gridServiceStub, 'resetCanvas');
        component.play();
        expect(spyReset).toHaveBeenCalled();
    });

    it('should resetCanvas when canClick in mouseDown is false', () => {
        const spyReset = spyOn(gridServiceStub, 'resetCanvas');
        const mouseEvent = new MouseEvent('mousedown');
        component.isFocus = false;
        component.onMouseDown(mouseEvent);
        expect(spyReset).toHaveBeenCalled();
    });

    it('gridPosition is undefined in onMouseDown', () => {
        const spy = spyOn(gridServiceStub, 'resetCanvas');
        const mouseEvent = new MouseEvent('mousedown');
        component.isFocus = true;
        component.onMouseDown(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('squareValid in onMouseDown', () => {
        // component.placeLetterService.inGridResult = true;
        const spy = spyOn(gridServiceStub, 'drawSelectionSquare');
        const mouseEvent = new MouseEvent('mousedown');
        component.isFocus = true;
        component.onMouseDown(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('squareValid and lastSquare in onMouseDown', () => {
        component.placeLetterService.gridPosition = { x: 15, y: 9 };
        const spy = spyOn(gridServiceStub, 'drawSelectionSquare');
        const mouseEvent = new MouseEvent('mousedown');
        component.isFocus = true;
        component.onMouseDown(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('backSpaceValid called backSpaceOperation in onKeyDown', () => {
        placeLetter.isPositionInit.and.returnValue(false);
        placeLetter.backSpaceEnable.and.returnValue(true);
        component.placeLetterService.gridPosition = { x: 15, y: 9 };
        const spy = spyOn(gridServiceStub, 'drawBonusOfPosition');
        const keyBoardEvent = new KeyboardEvent('backspace');
        component.onKeyDown(keyBoardEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('escape called escapeOperation in onKeyDown', () => {
        const LETTER = 'Escape';
        component.placeLetterService.gridPosition = { x: 15, y: 9 };
        const spy = spyOn(gridServiceStub, 'drawSquares');
        component.onKeyDown(new KeyboardEvent('keydown', { key: LETTER }));
        expect(spy).toHaveBeenCalled();
    });

    it('enter called enterOperation in onKeyDown', () => {
        const LETTER = 'Enter';
        component.placeLetterService.tempRack = ['e', 's', 't', 'a'];
        component.placeLetterService.gridPosition = { x: 15, y: 9 };
        component.onKeyDown(new KeyboardEvent('keydown', { key: LETTER }));
        expect(placeLetter.enterOperation).toHaveBeenCalled();
    });

    it('put a in myRack when onKeyDown', () => {
        component.squareSelected = true;
        component.placeLetterService.positionInit = { x: 8, y: 9 };
        component.placeLetterService.gridPosition = { x: 8, y: 9 };
        component.isLetter = true;
        component.placeLetterService.isLastSquare = false;
        const LETTER = 'a';

        const spy = spyOn<any>(component, 'handleKeyDown');
        component.onKeyDown(new KeyboardEvent('keydown', { key: LETTER }));
        expect(spy).toHaveBeenCalled();
    });

    it('put shift in myRack is disable when onKeyDown', () => {
        component.squareSelected = true;
        component.placeLetterService.positionInit = { x: 8, y: 9 };
        component.placeLetterService.gridPosition = { x: 8, y: 9 };
        component.isLetter = true;
        component.placeLetterService.isLastSquare = false;
        const LETTER = 'Shift';

        component.onKeyDown(new KeyboardEvent('keydown', { key: LETTER }));
        expect(component.isLetter).toBeFalse();
    });

    it('put d is disable in myRack when onKeyDown', () => {
        component.squareSelected = true;
        component.placeLetterService.positionInit = { x: 8, y: 9 };
        component.placeLetterService.gridPosition = { x: 8, y: 9 };
        component.isLetter = true;
        component.placeLetterService.isLastSquare = false;
        const LETTER = 'd';

        component.onKeyDown(new KeyboardEvent('keydown', { key: LETTER }));
        expect(component.isLetter).toBeFalse();
    });

    it('put A is disable in myRack when onKeyDown', () => {
        component.squareSelected = true;
        component.placeLetterService.positionInit = { x: 8, y: 9 };
        component.placeLetterService.gridPosition = { x: 8, y: 9 };
        component.isLetter = true;
        component.placeLetterService.isLastSquare = false;
        const LETTER = 'A';

        const spy = spyOn<any>(component, 'handleKeyDown');
        component.onKeyDown(new KeyboardEvent('keydown', { key: LETTER }));
        expect(spy).toHaveBeenCalled();
    });

    // it('put A is disable in myRack when onKeyDown', () => {
    //     rackServiceSpy.rack = ['e', 's', 't', 'q', 'a', 'b', 'c'];
    //     component.squareSelected = true;
    //     component.placeLetterService.positionInit = { x: 8, y: 9 };
    //     component.placeLetterService.gridPosition = { x: 8, y: 9 };
    //     component.isLetter = true;
    //     component.placeLetterService.isLastSquare = false;
    //     const LETTER = 'A';

    //     component.onKeyDown(new KeyboardEvent('keydown', { key: LETTER }));
    //     expect(component.isLetter).toBeFalse();
    // });

    // afterAll(() => cleanStyles());
});
