/* eslint-disable max-classes-per-file */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { Injectable, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { cleanStyles } from '@app/classes/helpers/cleanup.helper';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Constants } from '@app/constants/global.constants';
import { AppMaterialModule } from '@app/modules/material.module';
import { BoardService } from '@app/services/board/board.service';
import { GameService } from '@app/services/game/game.service';
import { GridService } from '@app/services/grid/grid.service';
import { PlaceLetterService } from '@app/services/place-letter/place-letter.service';
import { RackService } from '@app/services/rack/rack.service';
import { BoardComponent } from './board.component';

@Injectable({
    providedIn: 'root',
})
class GridServiceStub {
    letterFontFace = { font: '', size: 0 };

    isDrawGridCalled = false;
    isDrawSquareCalled = false;

    // eslint-disable-next-line no-unused-vars -- Its a stub, implemented to do nothing
    drawGrid(canvas: CanvasRenderingContext2D): void {
        this.isDrawGridCalled = true;
    }

    // eslint-disable-next-line no-unused-vars -- Its a stub, implemented to do nothing
    drawSquares(canvas: CanvasRenderingContext2D): void {
        this.isDrawSquareCalled = true;
    }
}

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

describe('BoardComponent', () => {
    const mockMyRack = ['e', 's', 't', '*', 'a', 'b', 'c'];
    let component: BoardComponent;
    let fixture: ComponentFixture<BoardComponent>;
    let gridServiceStub: GridServiceStub;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let placeLetterServiceSpy: jasmine.SpyObj<PlaceLetterService>;
    let rackServiceSpy: jasmine.SpyObj<RackService>;

    beforeEach(async () => {
        rackServiceSpy = jasmine.createSpyObj('RackService', [], { rack: mockMyRack });
        gameServiceSpy = jasmine.createSpyObj('GameService', [], ['currentTurn']);
        placeLetterServiceSpy = jasmine.createSpyObj(
            'PlaceLetterService',
            [
                'samePosition',
                'inGrid',
                'backSpaceOperation',
                'escapeOperation',
                'nextAvailableSquare',
                'enterOperation',
                'backSpaceEnable',
                'isPositionInit',
            ],
            ['gridPosition', 'isLastSquare', 'temprack', 'myRack', 'positionInit'],
        );
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent, MatCard, MatIcon],
            providers: [
                { provide: GridService, useClass: GridServiceStub },
                { provide: BoardService, useClass: BoardServiceMock },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: PlaceLetterService, useValue: placeLetterServiceSpy },
                { provide: RackService, useValue: rackServiceSpy },
            ],
            imports: [AppMaterialModule],
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

    afterAll(() => cleanStyles());
});
